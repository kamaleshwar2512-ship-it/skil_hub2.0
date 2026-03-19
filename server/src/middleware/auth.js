'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to verify JWT tokens and protect routes.
 */
function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(
        res,
        401,
        'UNAUTHORIZED',
        'Not authorized to access this route. Missing or invalid token format.'
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'Not authorized to access this route. Token not found.');
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Attach user payload to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'TOKEN_EXPIRED', 'Your access token has expired. Please refresh it.');
    }
    return errorResponse(res, 401, 'UNAUTHORIZED', 'Not authorized to access this route. Invalid token.');
  }
}

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER the `protect` middleware.
 * @param {...string} roles - Allowed roles (e.g., 'faculty', 'student')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 403, 'FORBIDDEN', 'User role not found.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        'FORBIDDEN',
        `User role '${req.user.role}' is not authorized to access this route.`
      );
    }
    
    next();
  };
}

module.exports = { protect, authorize };
