const User = require('../models/User');
const JWTService = require('../utils/jwt');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName, displayName } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          error: 'Missing required fields: email, password, firstName, lastName',
          code: 'MISSING_FIELDS'
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters long',
          code: 'WEAK_PASSWORD'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`
      });

      await user.save();

      // Generate tokens
      const tokens = JWTService.generateTokenPair(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          name: user.name,
          avatar: user.avatar,
          preferences: user.preferences,
          createdAt: user.createdAt
        },
        tokens
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is locked
      if (user.isLocked()) {
        return res.status(423).json({
          error: 'Account is temporarily locked due to too many failed login attempts',
          code: 'ACCOUNT_LOCKED',
          lockUntil: user.lockUntil
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        
        return res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = JWTService.generateTokenPair(user);

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          name: user.name,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        tokens
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      // Verify refresh token
      const { valid, payload, error } = JWTService.verifyRefreshToken(refreshToken);
      
      if (!valid) {
        return res.status(401).json({
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
          details: error
        });
      }

      // Find user
      const user = await User.findById(payload.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: 'User not found or inactive',
          code: 'USER_NOT_FOUND'
        });
      }

      // Generate new token pair
      const tokens = JWTService.generateTokenPair(user);

      res.json({
        message: 'Token refreshed successfully',
        tokens
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        code: 'REFRESH_ERROR'
      });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      // In a more advanced implementation, you might want to:
      // 1. Add the token to a blacklist
      // 2. Remove the refresh token from the user's refreshTokens array
      // 3. Track logout events

      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password -refreshTokens');
      
      res.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          name: user.name,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        code: 'PROFILE_ERROR'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, displayName, avatar, preferences } = req.body;
      
      const updateData = {};
      
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (displayName !== undefined) updateData.displayName = displayName;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (preferences !== undefined) updateData.preferences = preferences;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          name: user.name,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        error: 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Current password and new password are required',
          code: 'MISSING_PASSWORDS'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'New password must be at least 6 characters long',
          code: 'WEAK_PASSWORD'
        });
      }

      // Get user with password
      const user = await User.findById(req.user._id);
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Failed to change password',
        code: 'CHANGE_PASSWORD_ERROR'
      });
    }
  }

  // Verify token (for frontend to check if token is still valid)
  static async verifyToken(req, res) {
    try {
      // The auth middleware already verified the token and attached the user
      res.json({
        valid: true,
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          displayName: req.user.displayName,
          name: req.user.name,
          avatar: req.user.avatar,
          preferences: req.user.preferences
        }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(401).json({
        valid: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  }
}

module.exports = AuthController; 