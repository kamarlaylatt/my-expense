import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from '../controllers/expenseController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, createExpenseSchema, updateExpenseSchema } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Summary route (before :id to avoid conflict)
router.get('/summary', getExpenseSummary);

// CRUD routes
router.post('/', validate(createExpenseSchema), createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', validate(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

export default router;
