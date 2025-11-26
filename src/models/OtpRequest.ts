import mongoose, { Document, Schema } from "mongoose";

export interface IOtpRequest extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  consumed: boolean;
  createdAt: Date;
}

const OtpRequestSchema = new Schema<IOtpRequest>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient cleanup of expired OTPs
OtpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpRequest = mongoose.model<IOtpRequest>(
  "OtpRequest",
  OtpRequestSchema
);
