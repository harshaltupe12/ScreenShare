const JWTService = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const { valid, payload, error } = JWTService.verifyAccessToken(token);
    
    if (!valid) {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN',
        details: error
      });
    }

    // Find user
    const user = await User.findById(payload.userId).select('-password -refreshTokens');
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked due to too many failed login attempts.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error.',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const { valid, payload } = JWTService.verifyAccessToken(token);
    
    if (valid) {
      const user = await User.findById(payload.userId).select('-password -refreshTokens');
      if (user && user.isActive && !user.isLocked()) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { valid, payload, error } = JWTService.verifyAccessToken(token);
    
    if (!valid) {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN',
        details: error
      });
    }

    // Find user
    const user = await User.findById(payload.userId).select('-password -refreshTokens');
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is admin (you can add an isAdmin field to your User model)
    if (!user.isAdmin) {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'ADMIN_REQUIRED'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error.',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = { auth, optionalAuth, adminAuth }; 