import { Response, NextFunction } from "express";
import { verifyJwt } from "../services/authService";
import { AuthRequest } from "../types";

/**
 * Middleware to authenticate JWT tokens
 * Expects Authorization header: Bearer <token>
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = verifyJwt(token);

    if (!decoded) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId, // Updated to match the expected property name
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication failed",
    });
  }
};
