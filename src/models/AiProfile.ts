import mongoose, { Document, Schema } from "mongoose";

export interface IAiProfile extends Document {
  userId: mongoose.Types.ObjectId;
  summary: string;
  currentFocus: string[];
  strengths: string[];
  highlights: string[];
  lastGenerated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const aiProfileSchema = new Schema<IAiProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    summary: {
      type: String,
      default: "",
    },
    currentFocus: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    lastGenerated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const AiProfile = mongoose.model<IAiProfile>(
  "AiProfile",
  aiProfileSchema
);
