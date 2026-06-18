const express = require('express')
const routes = express.Router()
const {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification/notification.controller')

routes.get('/all', getAllNotifications)
routes.get('/unread-count', getUnreadCount)
routes.put('/read-all', markAllAsRead)
routes.put('/:id/read', markAsRead)

module.exports = routes
