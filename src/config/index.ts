import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  otpExpiryMinutes: number;
  otpCodeLength: number;
  nodeEnv: string;
  appUrl: string;
  appMode: "development" | "production";
  debugMode: boolean;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromEmail: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/goalnet",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10),
  otpCodeLength: parseInt(process.env.OTP_CODE_LENGTH || "6", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  appUrl: process.env.APP_URL || "http://localhost:3000",
  appMode:
    (process.env.APP_MODE as "development" | "production") || "development",
  debugMode: process.env.DEBUG_MODE === "true",

  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    fromName: process.env.SMTP_FROM_NAME || "GoalNet",
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
  },
};

// Validate critical config
if (
  config.nodeEnv === "production" &&
  config.jwtSecret === "your-secret-key-change-in-production"
) {
  throw new Error("JWT_SECRET must be set in production environment");
}

export default config;
