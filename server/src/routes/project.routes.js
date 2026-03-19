'use strict';
const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

const projectController = require('../controllers/project.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All endpoints require authentication
router.use(protect);

// Validation rules
const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('requiredSkills').optional().isArray(),
  body('maxTeamSize').optional().isInt({ min: 1, max: 20 })
];

const updateRules = [
  param('id').isInt(),
  body('title').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('requiredSkills').optional().isArray(),
  body('maxTeamSize').optional().isInt({ min: 1, max: 20 }),
  body('status').optional().isIn(['open', 'in_progress', 'completed'])
];

const listRules = [
  query('status').optional().isIn(['open', 'in_progress', 'completed']),
  query('skill').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

// Routes
router.post('/', validate(createRules), projectController.create);
router.get('/', validate(listRules), projectController.list);
router.get('/:id', validate([param('id').isInt()]), projectController.getById);
router.put('/:id', validate(updateRules), projectController.update);
router.delete('/:id', validate([param('id').isInt()]), projectController.delete);

// Collaboration & Team Management
router.get('/:id/recommendations', validate([param('id').isInt()]), projectController.getRecommendations);
router.post('/:id/join', validate([param('id').isInt()]), projectController.requestJoin);
router.put('/:id/members/:userId', validate([
  param('id').isInt(),
  param('userId').isInt(),
  body('action').isIn(['accept', 'reject'])
]), projectController.handleMember);

module.exports = router;
