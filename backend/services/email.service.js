const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.EMAIL_FROM || 'onboarding@resend.dev'

// ─── Labels legibles para cada estado ───────────────────────────────────────
const STATUS_LABELS = {
  CREATED:   'Pedido recibido',
  PREPARING: 'En preparación',
  SHIPPED:   'Enviado',
  DELIVERED: 'Entregado',
  RETURNED:  'Devuelto',
}

const STATUS_COLORS = {
  CREATED:   '#6366f1',
  PREPARING: '#f59e0b',
  SHIPPED:   '#3b82f6',
  DELIVERED: '#10b981',
  RETURNED:  '#ef4444',
}

// ─── Template base ───────────────────────────────────────────────────────────
function baseTemplate({ title, preheader, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#6366f1;padding:28px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Tu Tienda
              </p>
              <p style="margin:4px 0 0;font-size:13px;color:#c7d2fe;">Notificación de pedido</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Este correo es enviado automáticamente. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Template: envío creado ──────────────────────────────────────────────────
function shipmentCreatedHtml(order) {
  return baseTemplate({
    title:     `Pedido ${order.orderNumber} confirmado`,
    preheader: `Tu pedido ${order.orderNumber} ha sido recibido y está siendo procesado.`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:15px;color:#64748b;">Hola, <strong style="color:#1e293b;">${order.firstName}</strong></p>
      <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#1e293b;">¡Tu pedido está en camino!</h1>

      <!-- Badge estado -->
      <div style="display:inline-block;background:#eef2ff;color:#6366f1;border-radius:999px;padding:6px 16px;font-size:13px;font-weight:600;margin-bottom:24px;">
        📦 Pedido recibido
      </div>

      <!-- Info orden -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Número de orden</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#6366f1;">${order.orderNumber}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Destinatario</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:500;color:#1e293b;">${order.firstName} ${order.lastName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Dirección de entrega</p>
            <p style="margin:4px 0 0;font-size:15px;color:#1e293b;">${order.address}, ${order.municipality}, ${order.departament}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
        Hemos recibido tu pedido y ya comenzamos a procesarlo. Te notificaremos en cada etapa del proceso para que siempre sepas dónde está tu compra.
      </p>
    `,
  })
}

// ─── Template: actualización de estado ──────────────────────────────────────
function shipmentUpdatedHtml(order, shipment, newStatus) {
  const label = STATUS_LABELS[newStatus] ?? newStatus
  const color = STATUS_COLORS[newStatus] ?? '#6366f1'

  const statusEmoji = {
    PREPARING: '🔧',
    SHIPPED:   '🚚',
    DELIVERED: '✅',
    RETURNED:  '↩️',
  }[newStatus] ?? '📦'

  const statusMessages = {
    PREPARING: 'Nuestro equipo está preparando cuidadosamente tu pedido para el despacho.',
    SHIPPED:   'Tu pedido ya está en camino. Pronto llegará a tu puerta.',
    DELIVERED: '¡Tu pedido ha llegado! Esperamos que estés satisfecho con tu compra.',
    RETURNED:  'Tu pedido ha sido registrado como devuelto. Si tienes dudas, contáctanos.',
  }

  const trackingBlock = (newStatus === 'SHIPPED' && (shipment.trackingNumber || shipment.carrier))
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;overflow:hidden;margin:20px 0;">
        ${shipment.carrier ? `
        <tr>
          <td style="padding:14px 20px;border-bottom:1px solid #bfdbfe;">
            <p style="margin:0;font-size:12px;color:#93c5fd;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Transportista</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1d4ed8;">${shipment.carrier}</p>
          </td>
        </tr>` : ''}
        ${shipment.trackingNumber ? `
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0;font-size:12px;color:#93c5fd;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Número de seguimiento</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#1d4ed8;font-family:monospace;">${shipment.trackingNumber}</p>
          </td>
        </tr>` : ''}
      </table>`
    : ''

  return baseTemplate({
    title:     `Actualización de tu pedido ${order.orderNumber}`,
    preheader: `Tu pedido ${order.orderNumber} está ahora en estado: ${label}.`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:15px;color:#64748b;">Hola, <strong style="color:#1e293b;">${order.firstName}</strong></p>
      <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#1e293b;">Actualización de tu pedido</h1>

      <!-- Badge estado -->
      <div style="display:inline-block;background:${color}18;color:${color};border-radius:999px;padding:6px 16px;font-size:13px;font-weight:600;margin-bottom:24px;">
        ${statusEmoji} ${label}
      </div>

      <!-- Número orden -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Número de orden</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#6366f1;">${order.orderNumber}</p>
          </td>
        </tr>
      </table>

      ${trackingBlock}

      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
        ${statusMessages[newStatus] ?? 'El estado de tu pedido ha sido actualizado.'}
      </p>
    `,
  })
}

// ─── Funciones públicas ──────────────────────────────────────────────────────

const sendShipmentCreatedEmail = async (order) => {
  if (!process.env.RESEND_API_KEY || !order.email) return

  await resend.emails.send({
    from:    FROM,
    to:      order.email,
    subject: `✅ Pedido ${order.orderNumber} confirmado`,
    html:    shipmentCreatedHtml(order),
  })
}

const sendShipmentUpdatedEmail = async (order, shipment, newStatus) => {
  if (!process.env.RESEND_API_KEY || !order.email) return

  const subjects = {
    PREPARING: `🔧 Tu pedido ${order.orderNumber} está en preparación`,
    SHIPPED:   `🚚 Tu pedido ${order.orderNumber} ha sido enviado`,
    DELIVERED: `✅ Tu pedido ${order.orderNumber} fue entregado`,
    RETURNED:  `↩️ Tu pedido ${order.orderNumber} fue devuelto`,
  }

  await resend.emails.send({
    from:    FROM,
    to:      order.email,
    subject: subjects[newStatus] ?? `Actualización de tu pedido ${order.orderNumber}`,
    html:    shipmentUpdatedHtml(order, shipment, newStatus),
  })
}

module.exports = { sendShipmentCreatedEmail, sendShipmentUpdatedEmail }
