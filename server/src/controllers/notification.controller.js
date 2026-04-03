'use strict';
const notificationModel = require('../models/notification.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Lists notifications for the authenticated user.
 */
exports.list = (req, res, next) => {
  try {
    const { unread_only, page = 1, limit = 20 } = req.query;
    
    const unreadOnly = unread_only === 'true';

    const { notifications, total } = notificationModel.getByUserId(
      req.user.id,
      unreadOnly,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    const unreadCount = notificationModel.getUnreadCount(req.user.id);

    const meta = {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
      unreadCount
    };

    return successResponse(res, notifications, 200, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * Marks a specific notification as read.
 */
exports.markRead = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = notificationModel.getById(id);
    if (!notification) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Notification not found');
    }

    if (notification.user_id !== req.user.id) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Cannot modify another user\'s notification');
    }

    notificationModel.markAsRead(id, req.user.id);
    
    return successResponse(res, { message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Marks all notifications for the user as read.
 */
exports.markAllRead = (req, res, next) => {
  try {
    notificationModel.markAllAsRead(req.user.id);
    return successResponse(res, { message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a notification and emits a real-time event.
 */
exports.createNotification = (data) => {
  // Call existing DB logic
  const notification = notificationModel.createNotification(data);

  // Emit real-time notification
  try {
    const { getIO, getUserSocket } = require('../socket');
    const receiverId = data.userId; // user_id in DB is the receiver
    const socketId = getUserSocket(receiverId);
    
    if (socketId) {
      const io = getIO();
      io.to(socketId).emit("new_notification", notification);
    }
  } catch (err) {
    console.error('[Notification Emit Error]', err.message);
  }

  return notification;
};
