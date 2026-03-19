'use strict';
const { getDb } = require('../config/database');

/**
 * Creates a new project and adds the creator as the owner.
 */
function createProject(data) {
  const db = getDb();
  
  let projectId;
  
  db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO projects (owner_id, title, description, required_skills, max_team_size, status)
      VALUES (@owner_id, @title, @description, @required_skills, @max_team_size, @status)
    `);

    const info = stmt.run({
      owner_id: data.userId,
      title: data.title,
      description: data.description,
      required_skills: JSON.stringify(data.requiredSkills || []),
      max_team_size: data.maxTeamSize || 5,
      status: data.status || 'open'
    });

    projectId = info.lastInsertRowid;

    // Add creator as owner
    db.prepare(`
      INSERT INTO project_members (project_id, user_id, role, status)
      VALUES (?, ?, ?, ?)
    `).run(projectId, data.userId, 'owner', 'accepted');
  })();

  return findById(projectId);
}

/**
 * Retrieves a project by ID with member counts.
 */
function findById(id) {
  const db = getDb();
  
  const query = `
    SELECT p.*,
           (SELECT COUNT(*) FROM project_members WHERE project_id = p.id AND status = 'accepted') as current_team_size
    FROM projects p
    WHERE p.id = ?
  `;
  
  const project = db.prepare(query).get(id);
  
  if (project && project.required_skills) {
    try {
      project.required_skills = JSON.parse(project.required_skills);
    } catch(e) { /* ignore */ }
  }
  
  return project;
}

/**
 * Lists projects with filtering and pagination.
 */
function listProjects(filters = {}, page = 1, limit = 10) {
  const db = getDb();
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*,
           (SELECT COUNT(*) FROM project_members WHERE project_id = p.id AND status = 'accepted') as current_team_size
    FROM projects p
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    query += ` AND p.status = ?`;
    params.push(filters.status);
  }

  if (filters.skill) {
    query += ` AND p.required_skills LIKE ?`;
    params.push(`%${filters.skill}%`);
  }

  const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
  const total = db.prepare(countQuery).get(...params).total;

  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const projects = db.prepare(query).all(...params);

  projects.forEach(p => {
    if (p.required_skills) {
      try { p.required_skills = JSON.parse(p.required_skills); } catch(e) { }
    }
  });

  return { projects, total };
}

/**
 * Updates a project.
 */
function updateProject(id, data) {
  const db = getDb();
  
  const stmt = db.prepare(`
    UPDATE projects 
    SET title = COALESCE(@title, title),
        description = COALESCE(@description, description),
        required_skills = COALESCE(@required_skills, required_skills),
        max_team_size = COALESCE(@max_team_size, max_team_size),
        status = COALESCE(@status, status),
        updated_at = datetime('now')
    WHERE id = @id
  `);

  stmt.run({
    id,
    title: data.title !== undefined ? data.title : null,
    description: data.description !== undefined ? data.description : null,
    required_skills: data.requiredSkills ? JSON.stringify(data.requiredSkills) : null,
    max_team_size: data.maxTeamSize !== undefined ? data.maxTeamSize : null,
    status: data.status !== undefined ? data.status : null
  });

  return findById(id);
}

/**
 * Deletes a project.
 */
function deleteProject(id) {
  return getDb().prepare(`DELETE FROM projects WHERE id = ?`).run(id);
}

/**
 * Adds a member or request to join a project.
 */
function addMember(projectId, userId, role = 'member', status = 'pending') {
  const db = getDb();
  
  // Check if exists
  const existing = db.prepare(`SELECT * FROM project_members WHERE project_id = ? AND user_id = ?`).get(projectId, userId);
  
  if (existing) {
    throw new Error('User is already a member or has a pending request');
  }

  db.prepare(`
    INSERT INTO project_members (project_id, user_id, role, status)
    VALUES (?, ?, ?, ?)
  `).run(projectId, userId, role, status);
  
  return true;
}

/**
 * Updates a member's status (e.g., from pending to accepted) or role.
 */
function updateMemberStatus(projectId, userId, status, role = null) {
  const db = getDb();
  
  let query = `UPDATE project_members SET status = ?, joined_at = datetime('now')`;
  const params = [status];

  if (role) {
    query += `, role = ?`;
    params.push(role);
  }

  query += ` WHERE project_id = ? AND user_id = ?`;
  params.push(projectId, userId);

  return db.prepare(query).run(...params);
}

/**
 * Gets all members and requests for a project.
 */
function getMembers(projectId) {
  const db = getDb();
  return db.prepare(`
    SELECT pm.*, u.name, u.avatar_url, u.department, u.skills
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY pm.status ASC, pm.joined_at DESC
  `).all(projectId);
}

/**
 * Checks if a user is an owner of the project.
 */
function isProjectOwner(projectId, userId) {
  const db = getDb();
  const doc = db.prepare(`
    SELECT role FROM project_members 
    WHERE project_id = ? AND user_id = ? AND status = 'accepted'
  `).get(projectId, userId);
  return doc && doc.role === 'owner';
}

module.exports = {
  createProject,
  findById,
  listProjects,
  updateProject,
  deleteProject,
  addMember,
  updateMemberStatus,
  getMembers,
  isProjectOwner
};
