// backend/controllers/payment/webhook.controller.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createShipment } = require("../../services/shipment.service");

const epaycoWebhook = async (req, res) => {
  console.log("===============");
  console.log("WEBHOOK RECIBIDO");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("===============");

  try {
    const payload = req.body;

    const refPayco = payload.x_ref_payco;
    const transactionState = payload.x_transaction_state;
    const amount = payload.x_amount;
    const invoiceReference = payload.x_id_factura;

    if (!invoiceReference || !transactionState || !amount || !refPayco) {
      console.log("Payload incompleto:", { invoiceReference, transactionState, amount, refPayco });
      return res.status(400).send("Payload incompleto");
    }

    const payment = await prisma.payment.findUnique({
      where: {
        reference: invoiceReference
      }
    });

    if (!payment) {
      console.log("Payment no encontrado:", invoiceReference);
      return res.status(404).send("Payment no encontrado");
    }

    let paymentStatus = "PENDING";
    let orderStatus = "PENDING";

    if (transactionState === "Aceptada") {
      paymentStatus = "APPROVED";
      orderStatus = "PAID";
    } else if (transactionState === "Rechazada") {
      paymentStatus = "DECLINED";
      orderStatus = "CANCELLED";
    } else if (transactionState === "Fallida") {
      paymentStatus = "ERROR";
      orderStatus = "CANCELLED";
    } else if (transactionState === "Pendiente") {
      paymentStatus = "PENDING";
      orderStatus = "PENDING";
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          amount: parseFloat(amount),
          transactionId: String(refPayco)
        }
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: orderStatus }
      });

      if (paymentStatus === "APPROVED") {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: payment.orderId },
          select: { productVariantId: true, quantity: true }
        });

        for (const item of orderItems) {
          if (item.productVariantId) {
            await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: { stock: { decrement: item.quantity } }
            });
          }
        }
      }
    });

    console.log("Orden y pago actualizados correctamente");

    if (paymentStatus === "APPROVED") {
      createShipment(payment.orderId).catch((err) => {
        console.error("Error creando shipment para orden", payment.orderId, err);
      });
    }

    return res.status(200).send("OK");

  } catch (error) {
    console.error("ERROR WEBHOOK EPAYCO");
    console.error(error);

    return res.status(500).send("Error interno");
  }
};

module.exports = {
  epaycoWebhook
};