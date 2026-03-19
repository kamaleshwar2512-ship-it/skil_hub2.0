'use strict';
const { NODE_ENV } = require('../config/config');
const { errorResponse } = require('../utils/response');

/**
 * Global error handling middleware.
 * Must be registered after all routes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);
  if (NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle specific known error types
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return errorResponse(res, 409, 'CONFLICT', 'A record with that value already exists');
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return errorResponse(res, 400, 'INVALID_REFERENCE', 'Referenced record does not exist');
  }

  // Default to 500
  const message = NODE_ENV === 'development' ? err.message : 'Internal server error';
  return errorResponse(res, 500, 'INTERNAL_ERROR', message);
}

module.exports = { errorHandler };
