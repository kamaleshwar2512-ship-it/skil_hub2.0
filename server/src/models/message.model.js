const { getDb } = require('../config/database');

class MessageModel {
  static sendMessage(sender_id, receiver_id, content) {
    const db = getDb();
    const info = db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)')
      .run(sender_id, receiver_id, content);
    return {
      id: info.lastInsertRowid,
      sender_id,
      receiver_id,
      content,
      created_at: new Date().toISOString()
    };
  }

  static getMessages(user1, user2) {
    const db = getDb();
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(user1, user2, user2, user1);
    return messages;
  }
}

module.exports = MessageModel;
