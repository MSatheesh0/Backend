import mongoose, { Schema } from "mongoose";

export type DocumentType =
  | "pdf"
  | "doc"
  | "docx"
  | "ppt"
  | "pptx"
  | "image"
  | "link"
  | "other";

export interface IDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: DocumentType;
  url: string;
  fileSize?: number; // in bytes
  mimeType?: string;
  description?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
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
    type: {
      type: String,
      enum: ["pdf", "doc", "docx", "ppt", "pptx", "image", "link", "other"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by user
documentSchema.index({ userId: 1, createdAt: -1 });

export const UserDocument = mongoose.model<IDocument>(
  "Document",
  documentSchema
);
