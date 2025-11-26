import mongoose, { Document, Schema } from "mongoose";

export type GoalStatus = "active" | "completed" | "archived" | "cancelled";

export interface IMilestone {
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: GoalStatus;
  progress: number; // 0-100
  targetDate?: Date;
  milestones: IMilestone[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const goalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived", "cancelled"],
      default: "active",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    targetDate: {
      type: Date,
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
goalSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Goal = mongoose.model<IGoal>("Goal", goalSchema);
