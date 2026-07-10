const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createPayment = async (req, res) => {
    try {
        const { orderId, provider, reference, transactionId, currency, paymentMethod, cartUuid } = req.body;

        if (!orderId || !provider || !reference) {
            return res.status(400).json({ message: "Campos requeridos" });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        // `orderId` es un entero autoincremental fácil de adivinar/enumerar.
        // Exigimos que además coincida con `orderNumber` (el identificador
        // público, no secuencial, que solo conoce quien creó ese pedido)
        // para evitar que cualquiera registre un pago falso sobre la orden
        // de otra persona y bloquee su pago legítimo.
        if (!order || order.orderNumber !== reference) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // Segunda prueba de dueño: el UUID del carrito anónimo que creó el
        // pedido (mucho más difícil de adivinar que el orderNumber solo).
        // Si el pedido no tiene uno guardado (órdenes de antes de este
        // cambio) se omite esta verificación para no romperlas.
        if (order.cartUuid && order.cartUuid !== cartUuid) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        const existingPayment = await prisma.payment.findUnique({ where: { orderId } });
        if (existingPayment) {
            return res.status(400).json({ message: "La orden ya tiene un pago registrado" });
        }

        // El monto siempre se toma del total de la orden (incluye costo de envío).
        // Nunca del cliente, para evitar manipulación.
        const amount = Number(order.total);

        const payment = await prisma.payment.create({
            data: {
                orderId,
                provider,
                reference,
                transactionId: transactionId || null,
                amount,
                currency: currency || order.currency,
                paymentMethod: paymentMethod || null,
                status: "PENDING",
            }
        });

        return res.status(201).json({ message: "Pago creado", payment });

    } catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res.status(400).json({ message: "Referencia ya registrada" });
        }
        return res.status(500).json({ message: "Error interno" });
    }
};

const getPaymentMethods = async (req, res) => {
    try {
        const rows = await prisma.paymentMethod.findMany({
            where: { isActive: true },
            select: { name: true },
            orderBy: { id: 'asc' },
        })
        const methods = rows.map((r) => r.name)
        return res.status(200).json({ methods })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

// Recorre los ítems (sueltos y de combo) de la orden y devuelve el nombre del
// primer producto que ya no se pueda vender: la variante o el producto se
// desactivaron, o el stock actual (revisado en este momento, no la reserva
// original) ya no alcanza para lo que esta orden pidió. La reserva atómica
// (reservedStock) garantiza que nadie más se lleve esas unidades mientras la
// orden siga PENDING, pero no protege contra que un admin desactive el
// producto/variante o corrija el stock hacia abajo mientras el cliente tiene
// la pasarela abierta — por eso esto se revisa aparte, en cada reintento.
function findUnavailableProductInOrder(order) {
    for (const item of order.items ?? []) {
        const v = item.productVariant;
        if (!v || !v.isActive || v.product?.status !== "ACTIVE" || Number(v.stock) < item.quantity) {
            return v?.product?.name ?? item.productName;
        }
    }

    for (const bundleItem of order.bundleItems ?? []) {
        for (const detail of bundleItem.items ?? []) {
            const v = detail.productVariant;
            const required = bundleItem.quantity * detail.quantity;
            if (!v || !v.isActive || v.product?.status !== "ACTIVE" || Number(v.stock) < required) {
                return v?.product?.name ?? detail.productName;
            }
        }
    }

    return null;
}

const verifyPayment = async (req, res) => {
    try {
        const { reference, cartUuid } = req.query;
        if (!reference) return res.status(400).json({ message: "Referencia requerida" });

        const payment = await prisma.payment.findUnique({
            where: { reference },
            select: {
                status: true,
                order: {
                    select: {
                        cartUuid: true,
                        status: true,
                        items: {
                            select: {
                                quantity: true,
                                productName: true,
                                productVariant: {
                                    select: { isActive: true, stock: true, product: { select: { name: true, status: true } } }
                                }
                            }
                        },
                        bundleItems: {
                            select: {
                                quantity: true,
                                items: {
                                    select: {
                                        quantity: true,
                                        productName: true,
                                        productVariant: {
                                            select: { isActive: true, stock: true, product: { select: { name: true, status: true } } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!payment) return res.status(404).json({ message: "Pago no encontrado" });

        // Misma prueba de dueño que en createPayment: si el pedido tiene un
        // cartUuid guardado, debe coincidir con el de quien consulta. Evita
        // que cualquiera con el orderNumber (o adivinándolo) pueda ver el
        // estado de un pago ajeno.
        if (payment.order?.cartUuid && payment.order.cartUuid !== cartUuid) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }

        // orderStatus le permite al frontend saber si la orden sigue vigente
        // (PENDING = el stock sigue reservado) antes de reabrir la pasarela en
        // un reintento — si el pedido expiró/se canceló (releaseExpiredReservations
        // lo pasa a CANCELLED y libera el stock a los 30 min sin pago), no debe
        // reabrir la pasarela con datos obsoletos, sino forzar un pedido nuevo.
        //
        // unavailableProduct: aunque la orden siga PENDING, revisa en vivo si
        // algún producto/variante de la orden se desactivó o se quedó sin
        // stock desde que se creó — si el admin lo hizo mientras el cliente
        // tenía la pasarela abierta, el reintento debe bloquearse igual.
        const unavailableProduct = payment.order ? findUnavailableProductInOrder(payment.order) : null;

        return res.json({
            status: payment.status,
            orderStatus: payment.order?.status,
            unavailableProduct,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};

module.exports = {
    createPayment,
    getPaymentMethods,
    verifyPayment,
}
