'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/config');
const userModel = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Generate Access and Refresh Tokens
 */
function generateTokens(user) {
  const payload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY || '15m'
  });

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY || '7d'
  });

  return { accessToken, refreshToken };
}

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid input data', errors.array());
    }

    const { name, email, password, role, department, year, bio, skills, avatarUrl } = req.body;

    // Check if user exists
    const existingUser = userModel.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, 409, 'CONFLICT', 'Email is already registered.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = userModel.createUser({
      name,
      email,
      passwordHash,
      role,
      department,
      year,
      bio,
      skills,
      avatarUrl
    });

    const tokens = generateTokens(newUser);

    return successResponse(res, { user: newUser, ...tokens }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid credentials', errors.array());
    }

    const { email, password } = req.body;

    // Find user
    const user = userModel.findByEmail(email);
    if (!user) {
      return errorResponse(res, 401, 'AUTH_ERROR', 'Invalid email or password.');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, 'AUTH_ERROR', 'Invalid email or password. Password mismatch.');
    }

    const userProfile = userModel.findById(user.id);
    const tokens = generateTokens(userProfile);

    return successResponse(res, { user: userProfile, ...tokens });
  } catch (error) {
    console.error('Login Error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 401, 'AUTH_ERROR', 'Refresh token is required.');
    }

    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      
      const user = userModel.findById(decoded.id);
      if (!user) {
        return errorResponse(res, 401, 'AUTH_ERROR', 'User no longer exists.');
      }

      const tokens = generateTokens(user);

      return successResponse(res, tokens);
    } catch (err) {
      return errorResponse(res, 401, 'AUTH_ERROR', 'Invalid or expired refresh token.');
    }
  } catch (error) {
    next(error);
  }
};
