'use strict';
const { getDb } = require('../config/database');

/**
 * Creates a new user record in the database.
 * @param {Object} userData
 * @returns {Object} The created user (without password hash)
 */
function createUser(userData) {
  const db = getDb();
  
  const insertStmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, department, year, bio, skills, avatar_url)
    VALUES (@name, @email, @password_hash, @role, @department, @year, @bio, @skills, @avatar_url)
  `);

  const info = insertStmt.run({
    name: userData.name,
    email: userData.email,
    password_hash: userData.passwordHash,
    role: userData.role,
    department: userData.department,
    year: userData.year || null,
    bio: userData.bio || '',
    skills: JSON.stringify(userData.skills || []),
    avatar_url: userData.avatarUrl || null
  });

  return findById(info.lastInsertRowid);
}

/**
 * Retrieves a user by their email address.
 * @param {string} email
 * @returns {Object|undefined} The user object including password hash
 */
function findByEmail(email) {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  const user = stmt.get(email);
  console.log('[DEBUG] findByEmail matched user:', user ? user.email : 'None');
  return _formatUser(user);
}

/**
 * Retrieves a user by their primary ID.
 * @param {number|string} id
 * @returns {Object|undefined} The user object without password hash
 */
function findById(id) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, email, role, department, year, bio, skills, avatar_url, created_at, updated_at 
    FROM users 
    WHERE id = ?
  `);
  const user = stmt.get(id);
  return _formatUser(user);
}

/**
 * Helper to parse JSON fields safely before returning user rows.
 */
function _formatUser(user) {
  if (!user) return undefined;
  
  try {
    user.skills = JSON.parse(user.skills);
  } catch (e) {
    user.skills = [];
  }
  
  return user;
}

/**
 * Updates a user's editable profile information.
 * @param {number} id 
 * @param {Object} data 
 * @returns {Object} Updated user
 */
function updateUser(id, data) {
  const db = getDb();
  
  const stmt = db.prepare(`
    UPDATE users 
    SET bio = COALESCE(@bio, bio),
        skills = COALESCE(@skills, skills),
        department = COALESCE(@department, department),
        year = COALESCE(@year, year),
        avatar_url = COALESCE(@avatar_url, avatar_url),
        updated_at = datetime('now')
    WHERE id = @id
  `);

  stmt.run({
    id,
    bio: data.bio !== undefined ? data.bio : null,
    skills: data.skills ? JSON.stringify(data.skills) : null,
    department: data.department !== undefined ? data.department : null,
    year: data.year !== undefined ? data.year : null,
    avatar_url: data.avatarUrl !== undefined ? data.avatarUrl : null
  });

  return findById(id);
}

/**
 * Searches users with optional filters and pagination.
 * @param {Object} filters - search filters (query, department, skill)
 * @param {number} page
 * @param {number} limit
 */
function searchUsers(filters = {}, page = 1, limit = 10) {
  const db = getDb();
  const offset = (page - 1) * limit;
  let query = `
    SELECT id, name, role, department, year, bio, skills, avatar_url
    FROM users 
    WHERE 1=1
  `;
  const params = [];

  if (filters.query) {
    query += ` AND (name LIKE ? OR bio LIKE ?)`;
    params.push(`%${filters.query}%`, `%${filters.query}%`);
  }

  if (filters.department) {
    query += ` AND department = ?`;
    params.push(filters.department);
  }

  if (filters.skill) {
    query += ` AND skills LIKE ?`;
    params.push(`%${filters.skill}%`);
  }

  // Count total for pagination meta
  const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
  const total = db.prepare(countQuery).get(...params).total;

  query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const users = db.prepare(query).all(...params).map(_formatUser);

  return { users, total };
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateUser,
  searchUsers
};
