'use strict';
const { getDb } = require('../config/database');

/**
 * Creates a new notification.
 */
function createNotification(data) {
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO notifications (user_id, type, message, reference_id, reference_type)
    VALUES (@user_id, @type, @message, @reference_id, @reference_type)
  `);

  const info = stmt.run({
    user_id: data.userId,
    type: data.type,
    message: data.message,
    reference_id: data.referenceId || null,
    reference_type: data.referenceType || null
  });

  return getById(info.lastInsertRowid);
}

/**
 * Gets a notification by ID.
 */
function getById(id) {
  const db = getDb();
  return db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(id);
}

/**
 * Gets notifications for a user, with pagination.
 */
function getByUserId(userId, unreadOnly = false, page = 1, limit = 20) {
  const db = getDb();
  const offset = (page - 1) * limit;
  
  let query = `SELECT * FROM notifications WHERE user_id = ?`;
  const params = [userId];

  if (unreadOnly) {
    query += ` AND is_read = 0`;
  }

  const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
  const total = db.prepare(countQuery).get(...params).total;

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const notifications = db.prepare(query).all(...params);

  return { notifications, total };
}

/**
 * Marks a specific notification as read.
 */
function markAsRead(id, userId) {
  const db = getDb();
  const info = db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`).run(id, userId);
  return info.changes > 0;
}

/**
 * Marks all notifications as read for a user.
 */
function markAllAsRead(userId) {
  const db = getDb();
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`).run(userId);
}

/**
 * Retrieves the count of unread notifications for a user.
 */
function getUnreadCount(userId) {
  const db = getDb();
  return db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`).get(userId).count;
}

module.exports = {
  createNotification,
  getById,
  getByUserId,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
