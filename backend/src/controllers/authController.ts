import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { RegisterSchema, LoginSchema } from "../utils/validators.js";
import { AppError } from "../utils/errors.js";
import { generateToken, AuthRequest } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = RegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      throw new AppError("An account with this email address already exists.", 409, "EMAIL_EXISTS");
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const user = await User.create({
      name: validated.name,
      email: validated.email,
      passwordHash,
      role: "user"
    });

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info(`User registered successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = LoginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email });
    if (!user) {
      throw new AppError("Invalid email or password credentials.", 401, "INVALID_CREDENTIALS");
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password credentials.", 401, "INVALID_CREDENTIALS");
    }

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Successfully logged out."
  });
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError("User not authenticated", 401, "UNAUTHORIZED");
    }

    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      // Return lightweight session representation
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.userId,
            name: "Authenticated User",
            email: "user@session.local",
            role: "user"
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
