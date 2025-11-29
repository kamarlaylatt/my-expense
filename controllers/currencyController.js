import prisma from '../utils/prismaClient.js';

// Create a new currency
const createCurrency = async (req, res, next) => {
  try {
    const { name, usdExchangeRate } = req.body;
    const userId = req.user.id;

    // Check if currency with same name exists for this user
    const existingCurrency = await prisma.currency.findUnique({
      where: {
        name_userId: { name, userId },
      },
    });

    if (existingCurrency) {
      return res.status(409).json({
        success: false,
        message: 'Currency with this name already exists',
      });
    }

    const currency = await prisma.currency.create({
      data: {
        name,
        usdExchangeRate,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Currency created successfully',
      data: { currency },
    });
  } catch (error) {
    next(error);
  }
};

// Get all currencies for the authenticated user
const getCurrencies = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const currencies = await prisma.currency.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { currencies },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single currency by ID
const getCurrencyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const currency = await prisma.currency.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { currency },
    });
  } catch (error) {
    next(error);
  }
};

// Update a currency
const updateCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, usdExchangeRate } = req.body;
    const userId = req.user.id;

    // Check if currency exists and belongs to user
    const existingCurrency = await prisma.currency.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingCurrency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    // Check if another currency with the same name exists
    if (name && name !== existingCurrency.name) {
      const duplicateCurrency = await prisma.currency.findUnique({
        where: {
          name_userId: { name, userId },
        },
      });

      if (duplicateCurrency) {
        return res.status(409).json({
          success: false,
          message: 'Currency with this name already exists',
        });
      }
    }

    const currency = await prisma.currency.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(usdExchangeRate !== undefined && { usdExchangeRate }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Currency updated successfully',
      data: { currency },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a currency
const deleteCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if currency exists and belongs to user
    const existingCurrency = await prisma.currency.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingCurrency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    // Check if any expenses are using this currency
    const expenseCount = await prisma.expense.count({
      where: {
        currencyId: parseInt(id),
      },
    });

    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete currency. It is being used by ${expenseCount} expense(s).`,
      });
    }

    await prisma.currency.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Currency deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export { createCurrency, getCurrencies, getCurrencyById, updateCurrency, deleteCurrency };
