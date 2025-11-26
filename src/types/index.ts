import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string; // Added userId to match the expected property name
    email: string;
  };
}
