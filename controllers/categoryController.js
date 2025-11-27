import prisma from '../utils/prismaClient.js';

// Create a new category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.id;

    // Check if category with same name exists for this user
    const existingCategory = await prisma.category.findUnique({
      where: {
        name_userId: { name, userId },
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories for the authenticated user
const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Update a category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.id;

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if another category with the same name exists
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: {
          name_userId: { name, userId },
        },
      });

      if (duplicateCategory) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
