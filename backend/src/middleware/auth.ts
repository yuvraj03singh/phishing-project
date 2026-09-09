import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors.js";
import { User, IUser } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "phishing_detection_secure_jwt_secret_key_2026";

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      // Check HTTP-only cookie
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError("Authentication token is missing. Please log in.", 401, "UNAUTHORIZED");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    let user = null;
    try {
      user = await User.findById(decoded.id);
    } catch (e) {
      // ignore
    }

    if (!user) {
      // If DB is offline or mock user
      req.userId = decoded.id;
    } else {
      req.user = user;
      req.userId = user._id.toString();
    }

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired session token. Please log in again.", 401, "INVALID_TOKEN"));
    }
    next(error);
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        req.userId = decoded.id;
      } catch (e) {
        // Ignore invalid tokens for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export const generateToken = (user: { id: string; email: string; role?: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};
