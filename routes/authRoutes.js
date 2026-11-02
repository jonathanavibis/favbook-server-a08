import express from 'express';
import {
  registerUser,
  loginUser,
  socialAuth,
  issueJwt,
  getCurrentUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/social', socialAuth);
router.post('/jwt', issueJwt);
router.get('/me', protect, getCurrentUser);

export default router;
