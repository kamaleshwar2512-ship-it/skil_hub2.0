'use strict';
const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/user.controller');
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
router.get('/:id', userController.getUserById);

module.exports = router;
