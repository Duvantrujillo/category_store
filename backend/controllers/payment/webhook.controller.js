// backend/controllers/payment/webhook.controller.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


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
    } else if (transactionState === "Pendiente") {
      paymentStatus = "PENDING";
      orderStatus = "PENDING";
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id
        },
        data: {
          status: paymentStatus,
          amount: Number(amount),
          transactionId: String(refPayco)
        }
      }),

      prisma.order.update({
        where: {
          id: payment.orderId
        },
        data: {
          status: orderStatus
        }
      })
    ]);

    console.log("Orden y pago actualizados correctamente");

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