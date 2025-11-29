import express from 'express';
import {
  createCurrency,
  getCurrencies,
  getCurrencyById,
  updateCurrency,
  deleteCurrency,
} from '../controllers/currencyController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, createCurrencySchema, updateCurrencySchema } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', validate(createCurrencySchema), createCurrency);
router.get('/', getCurrencies);
router.get('/:id', getCurrencyById);
router.put('/:id', validate(updateCurrencySchema), updateCurrency);
router.delete('/:id', deleteCurrency);

export default router;
