'use strict';
const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

const achievementController = require('../controllers/achievement.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All endpoints require authentication
router.use(protect);

// Validation rules
const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').optional().isString(),
  body('proofUrl').optional().isURL().withMessage('Invalid proof URL'),
  body('achievedDate').optional().isISO8601().withMessage('Invalid date format')
];

const updateRules = [
  param('id').isInt(),
  body('title').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('category').optional().isString(),
  body('proofUrl').optional().isURL().withMessage('Invalid proof URL'),
  body('achievedDate').optional().isISO8601().withMessage('Invalid date format')
];

const listRules = [
  query('category').optional().isString(),
  query('department').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

const endorseRules = [
  param('id').isInt(),
  body('comment').optional().isString().trim()
];

// Routes
router.post('/', validate(createRules), achievementController.create);
router.get('/', validate(listRules), achievementController.list);
router.get('/:id', validate([param('id').isInt()]), achievementController.getById);
router.put('/:id', validate(updateRules), achievementController.update);
router.delete('/:id', validate([param('id').isInt()]), achievementController.delete);

// specialized action requiring explicit roles
router.post('/:id/endorse', authorize('faculty'), validate(endorseRules), achievementController.endorse);

module.exports = router;
