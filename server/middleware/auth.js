import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import memoryStore from '../services/memoryStore.js';

export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'omnipulse_jwt_super_secret_production_key_2025';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided. Please log in.',
    });
  }

  // Support instant demo mode tokens
  if (token === 'demo_fallback_token' || token.startsWith('demo_fallback_')) {
    const isCustomer = token.includes('customer');
    const email = isCustomer ? 'alex.rivera@techcorp.io' : 'agent@omnipulse.ai';
    const fallbackUser = memoryStore.findUserByEmail(email);
    if (fallbackUser) {
      req.user = fallbackUser;
      return next();
    }
  }

  try {
    const secret = process.env.JWT_SECRET || 'omnipulse_jwt_super_secret_production_key_2025';
    const decoded = jwt.verify(token, secret);

    let user = null;

    if (getIsConnected()) {
      try {
        user = await User.findById(decoded.id).select('-passwordHash');
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      user = memoryStore.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired token.',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'unknown'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};
