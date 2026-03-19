'use strict';
const postModel = require('../models/post.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Creates a new post on the feed.
 */
exports.create = (req, res, next) => {
  try {
    const { content, postType, relatedId } = req.body;
    
    const post = postModel.createPost({
      userId: req.user.id,
      content,
      postType,
      relatedId
    });

    return successResponse(res, post, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the infinite-scrolling feed, supporting trending vs recent modes.
 */
exports.getFeed = (req, res, next) => {
  try {
    const { sort = 'trending', page = 1, limit = 10 } = req.query;
    
    // Sort must be 'trending' or 'recent'
    if (!['trending', 'recent'].includes(sort)) {
      return errorResponse(res, 400, 'BAD_REQUEST', "Sort parameter must be 'trending' or 'recent'");
    }

    const currentUserId = req.user ? req.user.id : null;

    const { posts, total } = postModel.getFeed(
      sort, 
      parseInt(page, 10), 
      parseInt(limit, 10), 
      currentUserId
    );

    const meta = {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
      sort
    };

    return successResponse(res, posts, 200, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a post belonging to the current user.
 */
exports.delete = (req, res, next) => {
  try {
    const { id } = req.params;
    
    const post = postModel.findById(id);
    if (!post) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Post not found');
    }

    if (post.user_id !== req.user.id) {
      return errorResponse(res, 403, 'FORBIDDEN', 'You can only delete your own posts');
    }

    postModel.deletePost(id);
    return successResponse(res, { message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Likes a post and recalculates its trending score.
 */
exports.like = (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate post exists
    const post = postModel.findById(id);
    if (!post) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Post not found');
    }

    postModel.likePost(id, req.user.id);

    if (post.user_id !== req.user.id) {
      const liker = require('../models/user.model').findById(req.user.id);
      require('../models/notification.model').createNotification({
        userId: post.user_id,
        type: 'like',
        message: `${liker.name} liked your post.`,
        referenceId: id,
        referenceType: 'post'
      });
    }

    return successResponse(res, { message: 'Post liked' });
  } catch (error) {
    next(error);
  }
};

/**
 * Unlikes a post.
 */
exports.unlike = (req, res, next) => {
  try {
    const { id } = req.params;
    postModel.unlikePost(id, req.user.id);
    return successResponse(res, { message: 'Post unliked' });
  } catch (error) {
    next(error);
  }
};

/**
 * Comments on a post.
 */
exports.addComment = (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const post = postModel.findById(id);
    if (!post) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Post not found');
    }

    const comment = postModel.addComment(id, req.user.id, content);
    
    if (post.user_id !== req.user.id) {
      const commenter = require('../models/user.model').findById(req.user.id);
      require('../models/notification.model').createNotification({
        userId: post.user_id,
        type: 'comment',
        message: `${commenter.name} commented on your post.`,
        referenceId: id,
        referenceType: 'post'
      });
    }
    
    return successResponse(res, comment, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves paginated comments thread on a post.
 */
exports.getComments = (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const { comments, total } = postModel.getComments(id, parseInt(page, 10), parseInt(limit, 10));

    const meta = {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, comments, 200, meta);
  } catch (error) {
    next(error);
  }
};
