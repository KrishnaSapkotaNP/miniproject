import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as userModel from '../models/userModel.js';
import { ADMIN_CREDENTIALS } from '../config/admin.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

export const register = async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;

    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existing = await userModel.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await userModel.createUser(name, email, password);
    res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if admin login
    if (normalizedEmail === ADMIN_CREDENTIALS.username.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign(
        { id: 'admin', email: ADMIN_CREDENTIALS.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ message: 'Admin login successful', token, user: { id: 'admin', email: ADMIN_CREDENTIALS.username, role: 'admin' } });
    }

    const user = await userModel.getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await userModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const normalizedRole = user.role?.trim().toLowerCase();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: normalizedRole } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
