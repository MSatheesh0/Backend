import { Router, Request, Response } from "express";
import {
  createOtpRequest,
  verifyOtpAndGetUser,
  generateJwt,
  checkOtpRateLimit,
} from "../services/authService";

const router = Router();

/**
 * POST /auth/request-otp
 * Request OTP for email
 */
router.post(
  "/request-otp",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || typeof email !== "string") {
        res.status(400).json({
          error: "Bad Request",
          message: "Email is required",
        });
        return;
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: "Bad Request",
          message: "Invalid email format",
        });
        return;
      }

      // Check rate limit
      const canProceed = await checkOtpRateLimit(email.toLowerCase());
      if (!canProceed) {
        res.status(429).json({
          error: "Too Many Requests",
          message: "Too many OTP requests. Please try again later.",
        });
        return;
      }

      // Create OTP request
      await createOtpRequest(email.toLowerCase());

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("Error in request-otp:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to process OTP request",
      });
    }
  }
);

/**
 * POST /auth/verify-otp
 * Verify OTP and return JWT + user info
 */
router.post(
  "/verify-otp",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;

      // Validate inputs
      if (!email || typeof email !== "string") {
        res.status(400).json({
          error: "Bad Request",
          message: "Email is required",
        });
        return;
      }

      if (!otp || typeof otp !== "string") {
        res.status(400).json({
          error: "Bad Request",
          message: "OTP is required",
        });
        return;
      }

      // Verify OTP and get/create user
      const result = await verifyOtpAndGetUser(email.toLowerCase(), otp);

      if (!result) {
        res.status(400).json({
          error: "Bad Request",
          message: "Invalid or expired code",
        });
        return;
      }

      const { user, isNewUser } = result;

      // Generate JWT
      const token = generateJwt(user._id.toString(), user.email);

      // Return response
      res.status(200).json({
        token,
        isNewUser,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          primaryGoal: user.primaryGoal,
          company: user.company,
          website: user.website,
          location: user.location,
          oneLiner: user.oneLiner,
        },
      });
    } catch (error) {
      console.error("Error in verify-otp:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify OTP",
      });
    }
  }
);

export default router;
