'use strict';
const { getDb } = require('../config/database');

/**
 * Creates a new achievement record.
 */
function createAchievement(data) {
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO achievements (
      user_id, title, description, category, ml_category, ml_confidence, proof_url, achieved_date
    ) VALUES (
      @user_id, @title, @description, @category, @ml_category, @ml_confidence, @proof_url, @achieved_date
    )
  `);

  const info = stmt.run({
    user_id: data.userId,
    title: data.title,
    description: data.description,
    category: data.category,
    ml_category: data.mlCategory || null,
    ml_confidence: data.mlConfidence || null,
    proof_url: data.proofUrl || null,
    achieved_date: data.achievedDate || new Date().toISOString().split('T')[0]
  });

  return findById(info.lastInsertRowid);
}

/**
 * Retrieves an achievement by its ID.
 */
function findById(id) {
  const db = getDb();
  
  const query = `
    SELECT a.*, 
           u.name as user_name, u.avatar_url as user_avatar, u.department as user_department,
           (SELECT COUNT(*) FROM endorsements WHERE achievement_id = a.id) as endorsement_count
    FROM achievements a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `;
  
  return db.prepare(query).get(id);
}

/**
 * Retrieves all achievements for a specific user.
 */
function findByUserId(userId, category = null) {
  const db = getDb();
  
  let query = `
    SELECT a.*,
           (SELECT COUNT(*) FROM endorsements WHERE achievement_id = a.id) as endorsement_count
    FROM achievements a
    WHERE a.user_id = ?
  `;
  
  const params = [userId];
  
  if (category) {
    query += ` AND a.category = ?`;
    params.push(category);
  }
  
  query += ` ORDER BY a.achieved_date DESC`;
  
  return db.prepare(query).all(...params);
}

/**
 * Updates an editable achievement.
 */
function updateAchievement(id, data) {
  const db = getDb();
  
  const stmt = db.prepare(`
    UPDATE achievements 
    SET title = COALESCE(@title, title),
        description = COALESCE(@description, description),
        category = COALESCE(@category, category),
        proof_url = COALESCE(@proof_url, proof_url),
        achieved_date = COALESCE(@achieved_date, achieved_date),
        updated_at = datetime('now')
    WHERE id = @id
  `);

  stmt.run({
    id,
    title: data.title !== undefined ? data.title : null,
    description: data.description !== undefined ? data.description : null,
    category: data.category !== undefined ? data.category : null,
    proof_url: data.proofUrl !== undefined ? data.proofUrl : null,
    achieved_date: data.achievedDate !== undefined ? data.achievedDate : null
  });

  return findById(id);
}

/**
 * Deletes an achievement.
 */
function deleteAchievement(id) {
  const db = getDb();
  const stmt = db.prepare(`DELETE FROM achievements WHERE id = ?`);
  return stmt.run(id);
}

/**
 * Creates an endorsement record for an achievement.
 */
function endorseAchievement(achievementId, endorserId, comment = null) {
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO endorsements (achievement_id, endorser_id, comment)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(achievementId, endorserId, comment);
  return true;
}

/**
 * Lists paginated achievements across the platform with optional filters.
 */
function listAchievements(filters = {}, page = 1, limit = 10) {
  const db = getDb();
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT a.*, 
           u.name as user_name, u.avatar_url as user_avatar, u.department as user_department,
           (SELECT COUNT(*) FROM endorsements WHERE achievement_id = a.id) as endorsement_count
    FROM achievements a
    JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.category) {
    query += ` AND a.category = ?`;
    params.push(filters.category);
  }
  
  if (filters.department) {
    query += ` AND u.department = ?`;
    params.push(filters.department);
  }

  const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
  const total = db.prepare(countQuery).get(...params).total;

  query += ` ORDER BY a.achieved_date DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const achievements = db.prepare(query).all(...params);

  return { achievements, total };
}

module.exports = {
  createAchievement,
  findById,
  findByUserId,
  updateAchievement,
  deleteAchievement,
  endorseAchievement,
  listAchievements
};
