'use strict';
const { getDb } = require('../config/database');

/**
 * Calculates a trending score based on engagement metrics and recency.
 * Formula: (1.0 * likes) + (2.0 * comments) + (5.0 * recencyFactor)
 * @param {number} likeCount
 * @param {number} commentCount
 * @param {string} createdAt (ISO string)
 * @returns {number} The calculated trending score
 */
function calculateTrendingScore(likeCount, commentCount, createdAt) {
  const postDate = new Date(createdAt);
  const now = new Date();
  const hoursSincePost = Math.max(0, (now - postDate) / (1000 * 60 * 60));

  const recencyFactor = 1 / (1 + hoursSincePost / 24);
  const score = (1.0 * likeCount) + (2.0 * commentCount) + (5.0 * recencyFactor);

  return parseFloat(score.toFixed(4));
}

/**
 * Recalculates trending scores for all posts that are less than 7 days old.
 */
function updatePostTrendingScores() {
  const db = getDb();
  
  // Get recent posts
  const recentPosts = db.prepare(`
    SELECT id, created_at, 
           (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes,
           (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comments
    FROM posts 
    WHERE created_at > datetime('now', '-7 days')
  `).all();

  const updateStmt = db.prepare(`UPDATE posts SET trending_score = ? WHERE id = ?`);

  db.transaction(() => {
    for (const post of recentPosts) {
      const score = calculateTrendingScore(post.likes, post.comments, post.created_at);
      updateStmt.run(score, post.id);
    }
  })();
}

module.exports = {
  calculateTrendingScore,
  updatePostTrendingScores
};
