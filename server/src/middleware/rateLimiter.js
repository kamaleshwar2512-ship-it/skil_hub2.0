'use strict';
const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

/**
 * Rate limiter for authentication routes (10 requests/min per IP)
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please wait a minute before trying again.'
    );
  },
});

/**
 * General API rate limiter (100 requests/min per IP)
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please slow down.');
  },
});

module.exports = { authLimiter, generalLimiter };
