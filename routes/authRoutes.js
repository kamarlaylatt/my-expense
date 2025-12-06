import express from 'express';
import { signup, signin, getProfile, googleCallback } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, signupSchema, signinSchema, googleAuthSchema } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/signin', validate(signinSchema), signin);
router.post('/google', validate(googleAuthSchema), googleCallback);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
