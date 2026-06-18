const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ message: 'userId requerido' })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
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
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ message: 'userId requerido' })
    }

    const count = await prisma.notification.count({
      where: { userId: Number(userId), isRead: false }
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

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) }
    })

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' })
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
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'userId requerido' })
    }

    await prisma.notification.updateMany({
      where: { userId: Number(userId), isRead: false },
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
