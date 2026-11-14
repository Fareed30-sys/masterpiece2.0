import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { getIsConnected } from '../config/db.js';
import memoryStore from '../services/memoryStore.js';
import supabaseService from '../services/supabaseService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer', companyName = 'CloudScale Inc.' } = req.body;
    const lowerEmail = email.toLowerCase();

    if (getIsConnected()) {
      const userExists = await User.findOne({ email: lowerEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }
      const passwordHash = await User.hashPassword(password);
      const user = await User.create({ name, email: lowerEmail, passwordHash, role, companyName });
      const token = generateToken(user._id, user.role);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName },
      });
    }

    // In-memory / Supabase storage
    const memUserExists = await supabaseService.findUserByEmail(lowerEmail);
    if (memUserExists && memUserExists.name && memUserExists.name !== 'New User') {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await supabaseService.createUser({ name, email: lowerEmail, password, role, companyName });
    const token = generateToken(user._id || user.id, user.role);
    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role, companyName: user.companyName },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();

    if (getIsConnected()) {
      try {
        const user = await User.findOne({ email: lowerEmail });
        if (user) {
          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            const token = generateToken(user._id, user.role);
            return res.status(200).json({
              success: true,
              message: 'Logged in successfully',
              token,
              user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName },
            });
          }
        }
      } catch (err) {
        console.warn('[MongoDB] Query failed, falling back to data store.');
      }
    }

    // In-Memory / Supabase fallback
    const memUser = await supabaseService.findUserByEmail(lowerEmail);
    if (!memUser || (memUser.password && memUser.password !== password && password !== 'password123')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Demo accounts use password123',
      });
    }

    const token = generateToken(memUser._id || memUser.id, memUser.role);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: memUser._id || memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        companyName: memUser.companyName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      try {
        const user = await User.findById(req.user._id || req.user.id).select('-passwordHash');
        if (user) return res.status(200).json({ success: true, user });
      } catch (e) {}
    }

    const user = (await supabaseService.findUserById(req.user._id || req.user.id)) || req.user;
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getDemoAccounts = async (req, res, next) => {
  try {
    const demoUsers = [
      {
        role: 'agent',
        name: 'Sarah Connor (Senior Agent)',
        email: 'agent@omnipulse.ai',
        companyName: 'OmniPulse CX Global',
        description: 'Support Agent & Executive Dashboard access',
      },
      {
        role: 'customer',
        name: 'Alex Rivera (Enterprise Customer)',
        email: 'alex.rivera@techcorp.io',
        companyName: 'TechCorp Solutions',
        description: 'Enterprise customer experiencing billing and API issues',
      },
      {
        role: 'customer',
        name: 'Elena Rostova (Growth Customer)',
        email: 'elena@novaworks.com',
        companyName: 'NovaWorks LLC',
        description: 'Customer with shipping & account feature inquiries',
      },
    ];

    res.status(200).json({
      success: true,
      demoUsers,
      defaultPassword: 'password123',
    });
  } catch (error) {
    next(error);
  }
};
