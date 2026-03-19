'use strict';

/**
 * Send a standard success response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [statusCode=200]
 * @param {object} [meta] - pagination metadata
 */
function successResponse(res, data, statusCode = 200, meta = null) {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

/**
 * Send a standard error response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} code - machine-readable error code
 * @param {string} message - human-readable message
 * @param {Array} [details] - validation error details
 */
function errorResponse(res, statusCode, code, message, details = []) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details.length ? { details } : {}) },
  });
}

module.exports = { successResponse, errorResponse };
