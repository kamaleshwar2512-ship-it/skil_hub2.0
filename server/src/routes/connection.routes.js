const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/request', connectionController.sendRequest);
router.post('/accept', connectionController.acceptRequest);
router.get('/status/:userId', connectionController.getStatus);

module.exports = router;
