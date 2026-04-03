const ConnectionModel = require('../models/connection.model');
const { successResponse, errorResponse } = require('../utils/response');

exports.sendRequest = async (req, res) => {
  try {
    const requester_id = req.user.id;
    const { receiver_id } = req.body;

    if (!receiver_id || requester_id === parseInt(receiver_id)) {
      return errorResponse(res, 400, 'INVALID_REQUEST', 'Invalid receiver ID.');
    }

    const connection = ConnectionModel.createRequest(requester_id, parseInt(receiver_id));
    return successResponse(res, { connection }, 201);
  } catch (error) {
    console.error('[Connection] Send Request Error:', error);
    return errorResponse(res, 500, 'SERVER_ERROR', 'Failed to send connection request.');
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const receiver_id = req.user.id;
    const { requester_id } = req.body;

    if (!requester_id) {
      return errorResponse(res, 400, 'INVALID_REQUEST', 'Requester ID is required.');
    }

    const success = ConnectionModel.acceptRequest(parseInt(requester_id), receiver_id);
    if (!success) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Connection request not found or already accepted.');
    }

    return successResponse(res, null, 200);
  } catch (error) {
    console.error('[Connection] Accept Request Error:', error);
    return errorResponse(res, 500, 'SERVER_ERROR', 'Failed to accept connection request.');
  }
};

exports.getStatus = async (req, res) => {
  try {
    const user1 = req.user.id;
    const user2 = parseInt(req.params.userId);

    if (!user2) {
      return errorResponse(res, 400, 'INVALID_REQUEST', 'Target user ID is required.');
    }

    const statusObj = ConnectionModel.getStatus(user1, user2);
    return successResponse(res, statusObj || { status: 'none' }, 200);
  } catch (error) {
    console.error('[Connection] Get Status Error:', error);
    return errorResponse(res, 500, 'SERVER_ERROR', 'Failed to get connection status.');
  }
};
