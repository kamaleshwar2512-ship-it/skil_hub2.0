'use strict';
const achievementModel = require('../models/achievement.model');
const { classifyAchievement } = require('../services/ml.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Create a new achievement
 */
exports.create = async (req, res, next) => {
  try {
    const { title, description, category, proofUrl, achievedDate } = req.body;
    
    // Call ML service for categorization (fire-and-wait, degrades gracefully)
    const mlData = await classifyAchievement(title, description);

    const newAchievement = achievementModel.createAchievement({
      userId: req.user.id,
      title,
      description,
      category: category || (mlData ? mlData.category : 'other'),
      mlCategory: mlData ? mlData.category : null,
      mlConfidence: mlData ? mlData.confidence : null,
      proofUrl,
      achievedDate
    });

    return successResponse(res, newAchievement, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List paginated achievements
 */
exports.list = (req, res, next) => {
  try {
    const { category, department, page = 1, limit = 10 } = req.query;

    const filters = { category, department };

    const { achievements, total } = achievementModel.listAchievements(
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

    return successResponse(res, achievements, 200, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single achievement by ID
 */
exports.getById = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const achievement = achievementModel.findById(id);
    if (!achievement) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Achievement not found', [{ field: 'id', message: 'No achievement maps to this id.' }]);
    }

    return successResponse(res, achievement);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing achievement
 */
exports.update = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const achievement = achievementModel.findById(id);
    if (!achievement) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Achievement not found');
    }

    if (achievement.user_id !== req.user.id) {
      return errorResponse(res, 403, 'FORBIDDEN', 'You can only edit your own achievements');
    }

    const { title, description, category, proofUrl, achievedDate } = req.body;

    const updated = achievementModel.updateAchievement(id, {
      title, description, category, proofUrl, achievedDate
    });

    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an achievement
 */
exports.delete = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const achievement = achievementModel.findById(id);
    if (!achievement) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Achievement not found');
    }

    if (achievement.user_id !== req.user.id) {
      return errorResponse(res, 403, 'FORBIDDEN', 'You can only delete your own achievements');
    }

    achievementModel.deleteAchievement(id);

    return successResponse(res, { message: 'Achievement deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * Faculty endorse an achievement
 */
exports.endorse = (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    const achievement = achievementModel.findById(id);
    if (!achievement) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Achievement not found');
    }

    if (achievement.user_id === req.user.id) {
      return errorResponse(res, 400, 'BAD_REQUEST', 'You cannot endorse your own achievement');
    }

    achievementModel.endorseAchievement(id, req.user.id, comment);

    const endorser = require('../models/user.model').findById(req.user.id);
    require('../models/notification.model').createNotification({
      userId: achievement.user_id,
      type: 'endorsement',
      message: `${endorser.name} endorsed your achievement: ${achievement.title}.`,
      referenceId: id,
      referenceType: 'achievement'
    });
    
    return successResponse(res, { message: 'Achievement endorsed successfully' });
  } catch (error) {
    // Catch unique constraint if faculty already endorsed
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return errorResponse(res, 409, 'CONFLICT', 'You have already endorsed this achievement');
    }
    next(error);
  }
};
