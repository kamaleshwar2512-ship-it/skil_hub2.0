'use strict';
const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All endpoints require authentication
router.use(protect);

// Validation rules
const createRules = [
  body('content').trim().notEmpty().isLength({ max: 2000 }).withMessage('Content max 2000 chars'),
  body('postType').optional().isIn(['general', 'achievement', 'project_update', 'research']).withMessage('Invalid post type'),
  body('relatedId').optional().isInt()
];

const feedRules = [
  query('sort').optional().isIn(['trending', 'recent']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

const commentRules = [
  param('id').isInt(),
  body('content').trim().notEmpty().withMessage('Comment cannot be empty')
];

// Routes
router.post('/', validate(createRules), postController.create);
router.get('/', validate(feedRules), postController.getFeed);
router.delete('/:id', validate([param('id').isInt()]), postController.delete);

// Interactions
router.post('/:id/like', validate([param('id').isInt()]), postController.like);
router.delete('/:id/like', validate([param('id').isInt()]), postController.unlike);

// Comments
router.post('/:id/comments', validate(commentRules), postController.addComment);
router.get('/:id/comments', validate([param('id').isInt(), query('page').optional().isInt(), query('limit').optional().isInt()]), postController.getComments);

module.exports = router;
