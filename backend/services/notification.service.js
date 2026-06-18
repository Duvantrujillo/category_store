const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const LOW_STOCK_THRESHOLD = 5

// Rutas reales del panel de administración
const ROUTES = {
  orders:          '/dashboard/admin/list/order',
  shipments:       '/dashboard/admin/list/shipment',
  returns:         '/dashboard/admin/list/return',
  productVariants: '/dashboard/admin/list/product-variant',
}

const getAdminUserIds = async () => {
  const admins = await prisma.user.findMany({
    where: { role: { name: 'admin' } },
    select: { id: true }
  })
  return admins.map((a) => a.id)
}

const createForAdmins = async ({ type, title, message, actionUrl }) => {
  const adminIds = await getAdminUserIds()
  if (adminIds.length === 0) return

  await prisma.notification.createMany({
    data: adminIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      actionUrl: actionUrl || null
    }))
  })
}

const notifyOrderCreated = async (order) => {
  await createForAdmins({
    type: 'ORDER_CREATED',
    title: 'Nueva orden recibida',
    message: `Se ha registrado la orden ${order.orderNumber} y está pendiente de pago.`,
    actionUrl: ROUTES.orders
  })
}

const notifyOrderPaid = async (order) => {
  await createForAdmins({
    type: 'ORDER_PAID',
    title: 'Pago confirmado',
    message: `El pago de la orden ${order.orderNumber} fue aprobado exitosamente.`,
    actionUrl: ROUTES.orders
  })
}

const notifyOrderCancelled = async (order) => {
  await createForAdmins({
    type: 'ORDER_CANCELLED',
    title: 'Orden cancelada',
    message: `La orden ${order.orderNumber} fue cancelada debido a un error en el pago.`,
    actionUrl: ROUTES.orders
  })
}

const notifyPaymentDeclined = async (order) => {
  await createForAdmins({
    type: 'PAYMENT_DECLINED',
    title: 'Pago rechazado',
    message: `La pasarela de pago rechazó la transacción de la orden ${order.orderNumber}.`,
    actionUrl: ROUTES.orders
  })
}

const notifyShipmentCreated = async (shipment) => {
  const order = await prisma.order.findUnique({
    where: { id: shipment.orderId },
    select: { orderNumber: true }
  })
  if (!order) return

  await createForAdmins({
    type: 'SHIPMENT_CREATED',
    title: 'Envío generado',
    message: `Se ha creado el registro de envío para la orden ${order.orderNumber}. Proceda a coordinar el despacho.`,
    actionUrl: ROUTES.shipments
  })
}

const notifyReturnCreated = async (returnRequest) => {
  const order = await prisma.order.findUnique({
    where: { id: returnRequest.orderId },
    select: { orderNumber: true }
  })
  if (!order) return

  await createForAdmins({
    type: 'RETURN_CREATED',
    title: 'Solicitud de devolución recibida',
    message: `El cliente ha solicitado una devolución para la orden ${order.orderNumber}. Requiere revisión.`,
    actionUrl: ROUTES.returns
  })
}

const notifyReturnApproved = async (returnRequest) => {
  const order = await prisma.order.findUnique({
    where: { id: returnRequest.orderId },
    select: { orderNumber: true }
  })
  if (!order) return

  await createForAdmins({
    type: 'RETURN_APPROVED',
    title: 'Devolución aprobada',
    message: `La solicitud de devolución de la orden ${order.orderNumber} ha sido aprobada.`,
    actionUrl: ROUTES.returns
  })
}

const notifyReturnRejected = async (returnRequest) => {
  const order = await prisma.order.findUnique({
    where: { id: returnRequest.orderId },
    select: { orderNumber: true }
  })
  if (!order) return

  await createForAdmins({
    type: 'RETURN_REJECTED',
    title: 'Devolución rechazada',
    message: `La solicitud de devolución de la orden ${order.orderNumber} no fue aceptada.`,
    actionUrl: ROUTES.returns
  })
}

const notifyReturnCompleted = async (returnRequest) => {
  const order = await prisma.order.findUnique({
    where: { id: returnRequest.orderId },
    select: { orderNumber: true }
  })
  if (!order) return

  await createForAdmins({
    type: 'RETURN_COMPLETED',
    title: 'Devolución finalizada',
    message: `El proceso de devolución de la orden ${order.orderNumber} ha concluido satisfactoriamente.`,
    actionUrl: ROUTES.returns
  })
}

const notifyRefundProcessed = async (refund) => {
  const amount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(Number(refund.amount))

  await createForAdmins({
    type: 'REFUND_PROCESSED',
    title: 'Reembolso procesado',
    message: `Se ha procesado un reembolso por ${amount} asociado a una solicitud de devolución.`,
    actionUrl: ROUTES.returns
  })
}

const checkStockNotifications = async (variantIds) => {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, sku: true, stock: true, productId: true }
  })

  for (const variant of variants) {
    const sku = variant.sku || `variante-${variant.id}`

    if (variant.stock <= 0) {
      const existing = await prisma.notification.findFirst({
        where: { type: 'OUT_OF_STOCK', isRead: false, actionUrl: ROUTES.productVariants }
      })
      if (existing) continue

      await createForAdmins({
        type: 'OUT_OF_STOCK',
        title: 'Producto agotado',
        message: `La variante ${sku} ha alcanzado cero unidades en inventario. Se requiere reposición.`,
        actionUrl: ROUTES.productVariants
      })
    } else if (variant.stock <= LOW_STOCK_THRESHOLD) {
      const existing = await prisma.notification.findFirst({
        where: { type: 'LOW_STOCK', isRead: false, actionUrl: ROUTES.productVariants }
      })
      if (existing) continue

      await createForAdmins({
        type: 'LOW_STOCK',
        title: 'Stock bajo',
        message: `La variante ${sku} cuenta con ${variant.stock} unidades disponibles. Se recomienda reabastecer.`,
        actionUrl: ROUTES.productVariants
      })
    }
  }
}

module.exports = {
  notifyOrderCreated,
  notifyOrderPaid,
  notifyOrderCancelled,
  notifyPaymentDeclined,
  notifyShipmentCreated,
  notifyReturnCreated,
  notifyReturnApproved,
  notifyReturnRejected,
  notifyReturnCompleted,
  notifyRefundProcessed,
  checkStockNotifications
}
