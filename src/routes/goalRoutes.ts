import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { Goal } from "../models/Goal";
import mongoose from "mongoose";

const router = Router();

/**
 * GET /me/goals
 * List all active goals with progress
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const status = req.query.status as string | undefined;

    const filter: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (status) {
      filter.status = status;
    } else {
      // Default: show active goals
      filter.status = "active";
    }

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({
      goals: goals.map((goal) => ({
        id: goal._id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        progress: goal.progress,
        targetDate: goal.targetDate,
        milestones: goal.milestones,
        tags: goal.tags,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return res.status(500).json({ error: "Failed to fetch goals" });
  }
});

/**
 * POST /me/goals
 * Create new goal
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { title, description, targetDate, milestones, tags } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        error: "Missing required field",
        message: "title is required",
      });
    }

    const goal = await Goal.create({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      milestones: milestones || [],
      tags: tags || [],
      status: "active",
      progress: 0,
    });

    return res.status(201).json({
      id: goal._id,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      progress: goal.progress,
      targetDate: goal.targetDate,
      milestones: goal.milestones,
      tags: goal.tags,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    return res.status(500).json({ error: "Failed to create goal" });
  }
});

/**
 * PUT /me/goals/:id
 * Update goal progress/status
 */
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const goalId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ error: "Invalid goal ID" });
    }

    const {
      title,
      description,
      status,
      progress,
      targetDate,
      milestones,
      tags,
    } = req.body;

    // Validation
    if (
      status &&
      !["active", "completed", "archived", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Status must be: active, completed, archived, or cancelled",
      });
    }

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({
        error: "Invalid progress",
        message: "Progress must be between 0 and 100",
      });
    }

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (targetDate !== undefined)
      updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (milestones !== undefined) updateData.milestones = milestones;
    if (tags !== undefined) updateData.tags = tags;

    const goal = await Goal.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(goalId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      updateData,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    return res.json({
      id: goal._id,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      progress: goal.progress,
      targetDate: goal.targetDate,
      milestones: goal.milestones,
      tags: goal.tags,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    return res.status(500).json({ error: "Failed to update goal" });
  }
});

/**
 * DELETE /me/goals/:id
 * Delete or archive goal
 */
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const goalId = req.params.id;
    const archive = req.query.archive === "true";

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ error: "Invalid goal ID" });
    }

    if (archive) {
      // Archive instead of delete
      const goal = await Goal.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(goalId),
          userId: new mongoose.Types.ObjectId(userId),
        },
        { status: "archived" },
        { new: true }
      );

      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      return res.json({
        message: "Goal archived successfully",
        id: goal._id,
      });
    } else {
      // Permanently delete
      const goal = await Goal.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(goalId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      return res.json({
        message: "Goal deleted successfully",
        id: goal._id,
      });
    }
  } catch (error) {
    console.error("Error deleting goal:", error);
    return res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
