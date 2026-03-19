'use strict';
const express = require('express');
const { query, param } = require('express-validator');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All endpoints require authentication
router.use(protect);

const listRules = [
  query('unread_only').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

// Routes
router.get('/', validate(listRules), notificationController.list);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', validate([param('id').isInt()]), notificationController.markRead);

module.exports = router;
