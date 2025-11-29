import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional()
    .nullable(),
});

// Expense validation schemas
export const createExpenseSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive')
    .max(99999999.99, 'Amount is too large'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  categoryId: z.number({ required_error: 'Category ID is required', invalid_type_error: 'Category ID must be a number' }).int().positive(),
  currencyId: z.number({ required_error: 'Currency ID is required', invalid_type_error: 'Currency ID must be a number' }).int().positive(),
});

export const updateExpenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive')
    .max(99999999.99, 'Amount is too large')
    .optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  categoryId: z.number({ invalid_type_error: 'Category ID must be a number' }).int().positive().optional(),
  currencyId: z.number({ invalid_type_error: 'Currency ID must be a number' }).int().positive().optional().nullable(),
});

// Currency validation schemas
export const createCurrencySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  usdExchangeRate: z
    .number({ required_error: 'USD exchange rate is required', invalid_type_error: 'USD exchange rate must be a number' })
    .positive('USD exchange rate must be positive'),
});

export const updateCurrencySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional(),
  usdExchangeRate: z
    .number({ invalid_type_error: 'USD exchange rate must be a number' })
    .positive('USD exchange rate must be positive')
    .optional(),
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues?.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })) || [],
      });
    }
    next(error);
  }
};


