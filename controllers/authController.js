import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fav_book_super_secret_jwt_key_2026';
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role || 'user',
    },
    secret,
    { expiresIn: '30d' }
  );
};

// @desc    Register a new reader and save profile in MongoDB
// @route   POST /auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.',
      });
    }

    // Password validation rules (uppercase, lowercase, 6+ characters)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasMinLength = password.length >= 6;

    if (!hasUpperCase || !hasLowerCase || !hasMinLength) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and be at least 6 characters.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists in MongoDB records.',
      });
    }

    // Save user signup data to MongoDB
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      image: image?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      provider: 'credentials',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Signup successful! User data saved to MongoDB.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[registerUser Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration in database.',
      error: error.message,
    });
  }
};

// @desc    Authenticate user credentials against MongoDB
// @route   POST /auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email in database.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back to FavBook.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[loginUser Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message,
    });
  }
};

// @desc    Social OAuth sync (Google & GitHub) saving reader in MongoDB
// @route   POST /auth/social
// @access  Public
export const socialAuth = async (req, res) => {
  try {
    const { email, name, image, provider } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required from OAuth provider.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name || 'Social Reader',
        email: normalizedEmail,
        image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        provider: provider || 'google',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Social login successful via ${provider || 'OAuth'}! User saved to MongoDB.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[socialAuth Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Social authentication failed.',
      error: error.message,
    });
  }
};

// @desc    Issue signed JWT token for validated session
// @route   POST /jwt
// @access  Public
export const issueJwt = (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ success: false, message: 'User payload required for JWT.' });
  }

  const token = generateToken(user);
  return res.status(200).json({ success: true, token });
};

export const issueJwtToken = issueJwt;

// @desc    Get current authenticated user
// @route   GET /auth/me
// @access  Private (JWT Protected)
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
      error: error.message,
    });
  }
};
