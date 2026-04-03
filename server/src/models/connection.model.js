const { getDb } = require('../config/database');

class ConnectionModel {
  static createRequest(requester_id, receiver_id) {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM connections WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)').get(requester_id, receiver_id, receiver_id, requester_id);
    if (existing) {
      return existing;
    }
    const info = db.prepare('INSERT INTO connections (requester_id, receiver_id, status) VALUES (?, ?, ?)')
      .run(requester_id, receiver_id, 'pending');
    return { id: info.lastInsertRowid, requester_id, receiver_id, status: 'pending' };
  }

  static acceptRequest(requester_id, receiver_id) {
    const db = getDb();
    const info = db.prepare('UPDATE connections SET status = ? WHERE requester_id = ? AND receiver_id = ?')
      .run('accepted', requester_id, receiver_id);
    return info.changes > 0;
  }

  static getStatus(user1, user2) {
    const db = getDb();
    const connection = db.prepare('SELECT * FROM connections WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)')
      .get(user1, user2, user2, user1);
    return connection || null;
  }
}

module.exports = ConnectionModel;
