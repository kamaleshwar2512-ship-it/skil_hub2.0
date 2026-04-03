'use strict';
const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/user.controller');
const projectController = require('../controllers/project.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// Validation rules
const updateMeRules = [
  body('bio').optional().isString().trim(),
  body('skills').optional().isArray(),
  body('department').optional().isString().trim(),
  body('year').optional().isString().trim(),
  body('avatarUrl').optional().isURL().withMessage('Invalid URL format for avatar')
];

const searchRules = [
  query('q').optional().isString(),
  query('department').optional().isString(),
  query('skill').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

// Routes
router.get('/me', userController.getMe);
router.put('/me', validate(updateMeRules), userController.updateMe);
router.get('/', validate(searchRules), userController.searchUsers);
router.get('/:id', validate([param('id').isInt()]), userController.getUserById);

// AI Project Recommendations for a student (Student → Projects direction)
// GET /api/users/:id/recommendations
router.get(
  '/:id/recommendations',
  validate([param('id').isInt().withMessage('User ID must be an integer')]),
  projectController.getRecommendedProjects
);

module.exports = router;
