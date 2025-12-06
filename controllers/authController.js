import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { email, name, providerAccountId, provider, image } = req.body;

    if (!email || !providerAccountId || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, providerAccountId, provider',
      });
    }

    // Check if user exists with this provider account
    let user = await prisma.user.findFirst({
      where: {
        provider,
        providerAccountId,
      },
    });

    // If not found, check if user exists with this email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      // If email exists, link the Google account to the existing user
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider,
            providerAccountId,
            emailVerified: true,
            image: image || user.image,
          },
          select: {
            id: true,
            email: true,
            name: true,
            provider: true,
            providerAccountId: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            provider,
            providerAccountId,
            emailVerified: true,
            image,
          },
          select: {
            id: true,
            email: true,
            name: true,
            provider: true,
            providerAccountId: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { signup, signin, getProfile, googleCallback };
