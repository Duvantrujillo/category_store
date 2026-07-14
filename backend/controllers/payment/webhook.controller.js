// backend/controllers/payment/webhook.controller.js

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createShipment } = require("../../services/shipment.service");
const { confirmDiscountUsage } = require("../discount-code/discount_code.controller");
const { confirmPromotionUsage } = require("../promotion/promotion.controller");
const {
  notifyOrderPaid,
  notifyOrderCancelled,
  notifyPaymentDeclined,
  checkStockNotifications
} = require("../../services/notification.service");
const { sendOrderCancelledEmail, sendPaymentDeclinedEmail } = require("../../services/email.service");

const EPAYCO_CUST_ID = process.env.EPAYCO_CUST_ID;
const EPAYCO_P_KEY   = process.env.EPAYCO_P_KEY;

const TERMINAL_STATUSES = ["APPROVED", "DECLINED", "VOIDED", "ERROR"];

// --- Firma ePayco -----------------------------------------------------------
// Fórmula oficial: MD5(cust_id ^ p_key ^ x_ref_payco ^ x_transaction_id ^ x_amount ^ x_currency_code)
// x_amount debe tomarse como el string RAW del payload; no parsearlo antes de calcular el hash.
// Referencia: https://docs.epayco.co/payments/checkout/confirmation
function verifyEpaycoSignature(payload) {
  if (!EPAYCO_CUST_ID || !EPAYCO_P_KEY) {
    // Fail-closed: sin estas variables no hay forma de verificar que el
    // webhook realmente viene de ePayco. Rechazar es la opción segura —
    // aceptar sin firma permitiría marcar cualquier orden como pagada.
    console.error("EPAYCO_CUST_ID / EPAYCO_P_KEY no configurados — rechazando webhook por seguridad");
    return false;
  }

  const { x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_signature } = payload;

  // MD5 = 32 caracteres hex. Rechazar cualquier cosa que no luzca como un hash válido.
  if (!x_signature || !/^[0-9a-f]{32}$/i.test(x_signature)) return false;

  const raw      = `${EPAYCO_CUST_ID}^${EPAYCO_P_KEY}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
  const computed = crypto.createHash('md5').update(raw).digest('hex'); // siempre 32 chars lowercase

  // timingSafeEqual sobre los 16 bytes decodificados evita timing attacks.
  // Normalizamos x_signature a lowercase antes de decodificar para cubrir respuestas uppercase.
  const expectedBuf = Buffer.from(computed, 'hex');
  const receivedBuf = Buffer.from(x_signature.toLowerCase(), 'hex');

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

// --- Centinela de transacción ------------------------------------------------
// Lanzarlo dentro de $transaction hace rollback sin ser un error de infraestructura.
class WebhookAlreadyProcessed extends Error {
  constructor() {
    super("webhook_already_processed");
    this.name = "WebhookAlreadyProcessed";
  }
}

// ----------------------------------------------------------------------------

const epaycoWebhook = async (req, res) => {
  console.log(`WEBHOOK EPAYCO — ref: ${req.body?.x_id_factura} estado: ${req.body?.x_transaction_state}`);

  try {
    const payload = req.body;

    // x_amount se conserva como string crudo para calcular la firma correctamente.
    const refPayco        = payload.x_ref_payco;
    const transactionState = payload.x_transaction_state;
    const rawAmount        = payload.x_amount;
    const invoiceReference = payload.x_id_factura;

    if (!invoiceReference || !transactionState || !rawAmount || !refPayco) {
      console.log("Payload incompleto:", { invoiceReference, transactionState, rawAmount, refPayco });
      return res.status(400).send("Payload incompleto");
    }

    // 1. Validar firma ANTES de tocar la base de datos.
    if (!verifyEpaycoSignature(payload)) {
      console.warn("Firma ePayco inválida — ref:", invoiceReference);
      return res.status(401).send("Firma inválida");
    }

    const payment = await prisma.payment.findUnique({
      where: { reference: invoiceReference }
    });

    if (!payment) {
      // 200 en lugar de 404: evita que ePayco deje de reintentar si el webhook
      // llega antes de que el Payment exista en BD (ventana de timing muy estrecha).
      console.warn("Payment no encontrado en webhook — ref:", invoiceReference);
      return res.status(200).send("OK");
    }

    // 2. Fast-path: evitar abrir una transacción si el pago ya terminó.
    if (TERMINAL_STATUSES.includes(payment.status)) {
      console.log(`Webhook ignorado — estado terminal: ${payment.status} (ref: ${invoiceReference})`);
      return res.status(200).send("OK");
    }

    // 3. Validar monto — tolerancia de ±0.01 por redondeos de pasarela.
    //    Aquí SÍ parseamos, pero solo para la comparación numérica, no para el hash.
    const expectedAmount = parseFloat(payment.amount);
    const receivedAmount = parseFloat(rawAmount);
    if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
      console.warn(`Monto no coincide — esperado: ${expectedAmount}, recibido: ${receivedAmount} (ref: ${invoiceReference})`);
      return res.status(400).send("Monto no coincide");
    }

    // Mapear estado ePayco → estados internos.
    let paymentStatus = "PENDING";
    let orderStatus   = "PENDING";
    const isPending    = transactionState === "Pendiente";

    if      (transactionState === "Aceptada")  { paymentStatus = "APPROVED"; orderStatus = "PAID";      }
    else if (transactionState === "Rechazada") { paymentStatus = "DECLINED"; orderStatus = "CANCELLED"; }
    else if (transactionState === "Fallida")   { paymentStatus = "ERROR";    orderStatus = "CANCELLED"; }
    else if (transactionState === "Anulada")   { paymentStatus = "VOIDED";   orderStatus = "CANCELLED"; }
    // "Pendiente" → permanece PENDING; cualquier otro estado desconocido también
    // se trata como no-terminal para no liberar stock por error.
    else if (!isPending) {
      console.warn(`Estado ePayco desconocido ignorado: "${transactionState}" (ref: ${invoiceReference})`)
      return res.status(200).send("OK")
    }

    // 4. Race condition — barrera atómica real.
    //    updateMany con WHERE status='PENDING' es un compare-and-swap a nivel de BD:
    //    solo el primer worker que llegue puede actualizar la fila;
    //    los demás ven count=0 (PostgreSQL re-evalúa el WHERE tras adquirir el lock de fila).
    //    Todo lo que es irreversible (stock, estado de orden) vive dentro de esta misma transacción.
    let orderClaimed = false;

    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.payment.updateMany({
          where: { id: payment.id, status: "PENDING" },
          data: {
            status:        paymentStatus,
            amount:        receivedAmount,
            transactionId: String(refPayco)
          }
        });

        // 0 filas actualizadas → otro worker ganó la carrera o el estado ya cambió.
        if (claimed.count === 0) throw new WebhookAlreadyProcessed();

        // Barrera atómica también sobre la orden: si releaseExpiredReservations
        // (cron) ya la canceló y liberó su reserva mientras el cliente todavía
        // tenía la pasarela abierta (típico en pagos con tarjeta lentos, p.ej.
        // 3D-secure, que tardan más que RESERVATION_TTL_MS), NO hay que revivirla
        // ni descontar stock — esas unidades ya pueden estar vendidas a otra
        // persona. El pago queda registrado como APPROVED (el dinero sí entró)
        // pero la orden se deja como está y se marca para revisión manual.
        const orderClaim = await tx.order.updateMany({
          where: { id: payment.orderId, status: 'PENDING' },
          data:  { status: orderStatus }
        });

        if (orderClaim.count === 0) {
          console.error(
            `ALERTA — pago ${paymentStatus} confirmado para la orden ${payment.orderId} pero ya no estaba PENDING ` +
            `(probablemente cancelada por expiración de reserva antes de que el cliente terminara de pagar). ` +
            `Revisar manualmente: puede requerir reembolso o reconciliación de stock. ref: ${invoiceReference}`
          );
          return;
        }

        orderClaimed = true;

        const updatedOrder = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId } });

        // 5. Descuento de stock — ocurre UNA SOLA VEZ dentro de la transacción atómica.
        //    El gate es la propia transacción; no necesitamos volver a verificar el estado previo.
        // Obtener ítems una sola vez para los dos posibles caminos (sueltos y de combo)
        const orderItems = await tx.orderItem.findMany({
          where:  { orderId: payment.orderId },
          select: { productVariantId: true, quantity: true }
        });
        const orderBundleItems = await tx.orderBundleItem.findMany({
          where:  { orderId: payment.orderId },
          select: {
            quantity: true,
            items: { select: { productVariantId: true, quantity: true } }
          }
        });

        if (paymentStatus === "APPROVED") {
          // Pago confirmado: stock SIEMPRE se descuenta.
          // GREATEST evita reservedStock negativo si la reserva se perdió
          // (ej: órdenes pre-migración con reservedStock=0).
          // Sin condición WHERE en reservedStock: el descuento de stock real
          // no puede depender del estado de la reserva — el cliente ya pagó.
          for (const item of orderItems) {
            if (!item.productVariantId) continue
            await tx.$executeRaw`
              UPDATE ProductVariant
              SET stock         = stock - ${item.quantity},
                  reservedStock = GREATEST(reservedStock - ${item.quantity}, 0)
              WHERE id = ${item.productVariantId}
            `
          }
          // Por cada componente de cada combo, la cantidad a descontar es
          // quantity del combo × quantity del componente en la receta —
          // misma fórmula que se usó para reservar en createOrder.
          for (const bundleItem of orderBundleItems) {
            for (const detail of bundleItem.items) {
              const qty = bundleItem.quantity * detail.quantity
              await tx.$executeRaw`
                UPDATE ProductVariant
                SET stock         = stock - ${qty},
                    reservedStock = GREATEST(reservedStock - ${qty}, 0)
                WHERE id = ${detail.productVariantId}
              `
            }
          }

          // El cupón (si el pedido tenía uno) recién "cuenta" para su límite
          // de usos ahora que el pago quedó confirmado — no al crear la orden.
          await confirmDiscountUsage(tx, updatedOrder)
          await confirmPromotionUsage(tx, updatedOrder)
        } else if (!isPending) {
          // Pago rechazado o con error (nunca para "Pendiente" — ese sigue en
          // curso, p.ej. efectivo/PSE puede tardar horas en confirmarse, y la
          // reserva debe seguir en pie mientras tanto): liberar sin tocar stock.
          for (const item of orderItems) {
            if (!item.productVariantId) continue
            await tx.$executeRaw`
              UPDATE ProductVariant
              SET reservedStock = reservedStock - ${item.quantity}
              WHERE id = ${item.productVariantId}
                AND reservedStock >= ${item.quantity}
            `
          }
          for (const bundleItem of orderBundleItems) {
            for (const detail of bundleItem.items) {
              const qty = bundleItem.quantity * detail.quantity
              await tx.$executeRaw`
                UPDATE ProductVariant
                SET reservedStock = reservedStock - ${qty}
                WHERE id = ${detail.productVariantId}
                  AND reservedStock >= ${qty}
              `
            }
          }
        }
        // isPending (efectivo/PSE en curso): no se toca ni stock ni reservedStock.
      });
    } catch (err) {
      if (err instanceof WebhookAlreadyProcessed) {
        console.log(`Webhook concurrente ignorado (ref: ${invoiceReference})`);
        return res.status(200).send("OK");
      }
      throw err;
    }

    console.log("Orden y pago actualizados correctamente");

    // Si la orden ya no estaba PENDING (ver ALERTA arriba), el pago quedó
    // registrado pero deliberadamente no se tocó la orden ni el stock — por
    // lo tanto tampoco se dispara envío ni notificaciones para no confirmarle
    // al cliente/admin algo que el sistema no puede respaldar.
    if (!orderClaimed) return res.status(200).send("OK");

    const order = await prisma.order.findUnique({
      where:  { id: payment.orderId },
      select: { id: true, orderNumber: true, email: true, firstName: true, lastName: true, currency: true }
    });

    if (paymentStatus === "APPROVED" && order) {
      // 6. createShipment es ahora idempotente (captura P2002 internamente).
      //    No necesitamos verificar la existencia aquí — la BD lo garantiza.
      createShipment(payment.orderId).catch((err) => {
        console.error("Error creando shipment para orden", payment.orderId, err);
      });

      notifyOrderPaid(order).catch((err) => {
        console.error("Error notificando ORDER_PAID", err);
      });

      prisma.orderItem.findMany({
        where:  { orderId: payment.orderId },
        select: { productVariantId: true }
      }).then((items) => {
        const variantIds = items.map((i) => i.productVariantId).filter(Boolean);
        checkStockNotifications(variantIds).catch((err) => {
          console.error("Error revisando stock notifications", err);
        });
      }).catch((err) => {
        console.error("Error obteniendo variants para stock check", err);
      });
    }

    if (paymentStatus === "DECLINED" && order) {
      notifyPaymentDeclined(order).catch((err) => {
        console.error("Error notificando PAYMENT_DECLINED", err);
      });
      sendPaymentDeclinedEmail(order).catch((err) => {
        console.error("Error enviando email PAYMENT_DECLINED", err);
      });
    }

    if (paymentStatus === "ERROR" && order) {
      notifyOrderCancelled(order).catch((err) => {
        console.error("Error notificando ORDER_CANCELLED", err);
      });
      sendOrderCancelledEmail(order).catch((err) => {
        console.error("Error enviando email ORDER_CANCELLED", err);
      });
    }

    return res.status(200).send("OK");

  } catch (error) {
    console.error("ERROR WEBHOOK EPAYCO", error);
    return res.status(500).send("Error interno");
  }
};

module.exports = { epaycoWebhook };
