import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (user) => {
  const secret =
    process.env.JWT_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    'bookhype_secret_key_super_secure_2026_jwt_token';

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

// @desc    Register a new library user
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

    // Password validation rules
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasMinLength = password.length >= 6;

    if (!hasUpperCase || !hasLowerCase || !hasMinLength) {
      return res.status(400).json({
        success: false,
        message: 'Password must have at least 1 uppercase letter, 1 lowercase letter, and be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      image: image?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Welcome to BookHype! Your reader account has been created.',
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
    console.error('[registerUser Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
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
        message: 'No account found with this email. Please register first.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password entered. Please try again.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully! Welcome back to BookHype.',
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
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

// @desc    OAuth/Google social login sync
// @route   POST /auth/social
// @access  Public
export const socialAuth = async (req, res) => {
  try {
    const { email, name, image } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from OAuth provider.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name || 'Google Reader',
        email: normalizedEmail,
        image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Social authentication successful!',
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
    console.error('[socialAuth Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Social authentication failed',
      error: error.message,
    });
  }
};

// @desc    Issue token for authenticated BetterAuth or verified session
// @route   POST /jwt
// @access  Public
export const issueJwtToken = (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ success: false, message: 'User details required for token generation' });
  }

  const token = generateToken(user);
  return res.status(200).json({ success: true, token });
};
