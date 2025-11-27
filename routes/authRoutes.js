import express from 'express';
import { signup, signin, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, signupSchema, signinSchema } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/signin', validate(signinSchema), signin);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
