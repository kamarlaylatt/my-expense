import prisma from '../utils/prismaClient.js';

// Create a new expense
const createExpense = async (req, res, next) => {
  try {
    const { amount, description, date, categoryId, currencyId } = req.body;
    const userId = req.user.id;

    // Verify category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Verify currency exists and belongs to user
    const currency = await prisma.currency.findFirst({
      where: {
        id: currencyId,
        userId,
      },
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        date: date ? new Date(date) : new Date(),
        categoryId,
        currencyId,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        currency: {
          select: {
            id: true,
            name: true,
            usdExchangeRate: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

// Get all expenses for the authenticated user
const getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categoryId, startDate, endDate, page = 1, limit = 10 } = req.query;

    const where = { userId };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          currency: {
            select: {
              id: true,
              name: true,
              usdExchangeRate: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.expense.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single expense by ID
const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await prisma.expense.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        currency: {
          select: {
            id: true,
            name: true,
            usdExchangeRate: true,
          },
        },
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

// Update an expense
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, description, date, categoryId, currencyId } = req.body;
    const userId = req.user.id;

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // If categoryId is being updated, verify it exists and belongs to user
    if (categoryId && categoryId !== existingExpense.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId,
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
    }

    // If currencyId is being updated, verify it exists and belongs to user
    if (currencyId !== undefined && currencyId !== null && currencyId !== existingExpense.currencyId) {
      const currency = await prisma.currency.findFirst({
        where: {
          id: currencyId,
          userId,
        },
      });

      if (!currency) {
        return res.status(404).json({
          success: false,
          message: 'Currency not found',
        });
      }
    }

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        ...(amount !== undefined && { amount }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
        ...(currencyId !== undefined && { currencyId: currencyId }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        currency: {
          select: {
            id: true,
            name: true,
            usdExchangeRate: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

// Delete an expense
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get expense summary/statistics
const getExpenseSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [totalExpenses, expensesByCategory] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Get category details for the summary
    const categoryIds = expensesByCategory.map((e) => e.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true },
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    const summary = {
      totalAmount: totalExpenses._sum.amount || 0,
      totalCount: totalExpenses._count,
      byCategory: expensesByCategory.map((e) => ({
        category: categoryMap[e.categoryId],
        totalAmount: e._sum.amount,
        count: e._count,
      })),
    };

    res.status(200).json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};

export { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseSummary };
