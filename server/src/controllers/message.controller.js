const MessageModel = require('../models/message.model');
const { successResponse, errorResponse } = require('../utils/response');

exports.sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content || !content.trim()) {
      return errorResponse(res, 400, 'INVALID_REQUEST', 'Receiver ID and content are required.');
    }

    const message = MessageModel.sendMessage(sender_id, parseInt(receiver_id), content.trim());
    return successResponse(res, { message }, 201);
  } catch (error) {
    console.error('[Message] Send Error:', error);
    return errorResponse(res, 500, 'SERVER_ERROR', 'Failed to send message.');
  }
};

exports.getMessages = async (req, res) => {
  try {
    const user1 = req.user.id;
    const user2 = parseInt(req.params.userId);

    if (!user2) {
      return errorResponse(res, 400, 'INVALID_REQUEST', 'Target user ID is required.');
    }

    const messages = MessageModel.getMessages(user1, user2);
    return successResponse(res, messages, 200);
  } catch (error) {
    console.error('[Message] Get Error:', error);
    return errorResponse(res, 500, 'SERVER_ERROR', 'Failed to retrieve messages.');
  }
};

