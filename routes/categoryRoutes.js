import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, createCategorySchema, updateCategorySchema } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', validate(createCategorySchema), createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
