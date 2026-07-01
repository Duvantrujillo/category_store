const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }]
    })

    return res.status(200).json({ ok: true, notifications })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    })

    return res.status(200).json({ ok: true, count })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) }
    })

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' })
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }

    if (notification.isRead) {
      return res.status(200).json({ ok: true, notification })
    }

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true, readAt: new Date() }
    })

    return res.status(200).json({ ok: true, notification: updated })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    })

    return res.status(200).json({ ok: true, message: 'Todas las notificaciones marcadas como leídas' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

module.exports = {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}
