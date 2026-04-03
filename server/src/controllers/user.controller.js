'use strict';
const userModel = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get current authenticated user profile
 */
exports.getMe = (req, res, next) => {
  try {
    const user = userModel.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'NOT_FOUND', 'User profile not found');
    }
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update current authenticated user profile
 */
exports.updateMe = (req, res, next) => {
  try {
    const { bio, skills, department, year, avatarUrl } = req.body;
    
    // update current user based on token identity
    const updatedUser = userModel.updateUser(req.user.id, {
      bio, 
      skills, 
      department,
      year,
      avatarUrl
    });

    return successResponse(res, updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific user by their ID
 */
exports.getUserById = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = userModel.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'NOT_FOUND', 'User not found');
    }

    // A real app might join achievements and posts here or let the client fetch them.
    // Based on Phase 3 PRD, the initial implementation just returns the public profile.

    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Search users by query parameters
 */
exports.searchUsers = (req, res, next) => {
  try {
    const { q, department, skill, page = 1, limit = 10 } = req.query;
    
    const filters = {
      query: q,
      department,
      skill
    };

    const { users, total } = userModel.searchUsers(
      filters, 
      parseInt(page, 10), 
      parseInt(limit, 10)
    );

    const meta = {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, users, 200, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * Minimal function to trigger connection request notification
 */
exports.sendConnectionRequest = (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;
    
    if (!receiverId) {
      return errorResponse(res, 400, 'BAD_REQUEST', 'receiverId is required');
    }

    // Call existing notification creation from notification controller
    const notificationController = require('./notification.controller');
    notificationController.createNotification({
      userId: receiverId, // Receiver of the notification
      type: 'collab_request',
      message: `User ${senderId} sent you a connection request.`,
      referenceId: senderId,
      referenceType: 'user'
    });

    return successResponse(res, { message: 'Connection request sent' }, 201);
  } catch (error) {
    next(error);
  }
};

