'use strict';
const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Reusable express-validator wrapper.
 * Runs specified rules and short-circuits with a formatted error if any fail.
 * 
 * @param {Array} rules - Array of express-validator middlewares
 */
const validate = (rules) => {
  return async (req, res, next) => {
    // Execute all validation rules
    await Promise.all(rules.map((rule) => rule.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors using standard response
    return errorResponse(
      res, 
      422, 
      'VALIDATION_ERROR', 
      'One or more fields are invalid', 
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  };
};

module.exports = { validate };
