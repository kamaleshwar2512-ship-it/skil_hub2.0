'use strict';
const { getDb } = require('../config/database');
const trendingService = require('../services/trending.service');

/**
 * Creates a new post.
 */
function createPost(data) {
  const db = getDb();
  
  // Calculate initial trending score (0 likes, 0 comments)
  const initialScore = trendingService.calculateTrendingScore(0, 0, new Date().toISOString());

  const stmt = db.prepare(`
    INSERT INTO posts (user_id, content, post_type, image_url, trending_score)
    VALUES (@user_id, @content, @post_type, @image_url, @trending_score)
  `);

  const info = stmt.run({
    user_id: data.userId,
    content: data.content,
    post_type: data.postType || 'general',
    image_url: data.imageUrl || null,
    trending_score: initialScore
  });

  return findById(info.lastInsertRowid);
}

/**
 * Retrieves a post by its ID.
 */
function findById(id) {
  const db = getDb();
  
  const query = `
    SELECT p.*,
           u.name as author_name, u.avatar_url as author_avatar, u.department as author_department,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `;
  
  return db.prepare(query).get(id);
}

/**
 * Retrieves the post feed with pagination and sorting.
 */
function getFeed(sort = 'trending', page = 1, limit = 10, currentUserId = null) {
  const db = getDb();
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT p.*,
           u.name as author_name, u.avatar_url as author_avatar, u.department as author_department,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
  `;

  if (currentUserId) {
    query += `, EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ${Number(currentUserId)}) as is_liked_by_user`;
  } else {
    query += `, 0 as is_liked_by_user`;
  }

  query += `
    FROM posts p
    JOIN users u ON p.user_id = u.id
  `;

  const countQuery = `SELECT COUNT(*) as total FROM posts`;
  const total = db.prepare(countQuery).get().total;

  if (sort === 'trending') {
    query += ` ORDER BY p.trending_score DESC, p.created_at DESC`;
  } else { // recent
    query += ` ORDER BY p.created_at DESC`;
  }

  query += ` LIMIT ? OFFSET ?`;
  
  // Update trending scores globally occasionally 
  // (In a real app, this would be a CRON job, but we'll do an async fire-and-forget here)
  setTimeout(() => trendingService.updatePostTrendingScores(), 0);

  const posts = db.prepare(query).all(limit, offset);

  // Convert boolean
  return { 
    posts: posts.map(p => ({ ...p, is_liked_by_user: !!p.is_liked_by_user })), 
    total 
  };
}

/**
 * Deletes a post.
 */
function deletePost(id) {
  const db = getDb();
  return db.prepare(`DELETE FROM posts WHERE id = ?`).run(id);
}

/**
 * Likes a post.
 */
function likePost(postId, userId) {
  const db = getDb();
  try {
    db.prepare(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`).run(postId, userId);
  } catch (err) {
    if (err.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY' && err.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
      throw err;
    } // Ignore duplicate likes silently
  }
}

/**
 * Unlikes a post.
 */
function unlikePost(postId, userId) {
  const db = getDb();
  db.prepare(`DELETE FROM likes WHERE post_id = ? AND user_id = ?`).run(postId, userId);
}

/**
 * Adds a comment to a post.
 */
function addComment(postId, userId, content) {
  const db = getDb();
  const info = db.prepare(`
    INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)
  `).run(postId, userId, content);
  
  return getCommentById(info.lastInsertRowid);
}

/**
 * Gets a specific comment by ID.
 */
function getCommentById(id) {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, u.name as author_name, u.avatar_url as author_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(id);
}

/**
 * Gets paginated comments for a post.
 */
function getComments(postId, page = 1, limit = 10) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const total = db.prepare(`SELECT COUNT(*) as t FROM comments WHERE post_id = ?`).get(postId).t;

  const comments = db.prepare(`
    SELECT c.*, u.name as author_name, u.avatar_url as author_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
    LIMIT ? OFFSET ?
  `).all(postId, limit, offset);

  return { comments, total };
}

module.exports = {
  createPost,
  findById,
  getFeed,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments
};
