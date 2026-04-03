const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', messageController.sendMessage);
router.get('/:userId', messageController.getMessages);

module.exports = router;
