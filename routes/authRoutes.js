import express from 'express';
import {
  registerUser,
  loginUser,
  socialAuth,
  issueJwtToken,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/social', socialAuth);
router.post('/jwt', issueJwtToken);

export default router;
