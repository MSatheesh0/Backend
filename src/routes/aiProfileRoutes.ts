import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getAiProfile,
  regenerateAiProfile,
} from "../services/aiProfileService";

const router = Router();

/**
 * GET /me/ai-profile
 * Get AI-generated profile content
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const aiProfile = await getAiProfile(userId);

    res.json({
      summary: aiProfile.summary,
      currentFocus: aiProfile.currentFocus,
      strengths: aiProfile.strengths,
      highlights: aiProfile.highlights,
      lastGenerated: aiProfile.lastGenerated,
    });
  } catch (error) {
    console.error("Error fetching AI profile:", error);
    res.status(500).json({ error: "Failed to fetch AI profile" });
  }
});

/**
 * POST /me/ai-profile/regenerate
 * Regenerate AI profile content
 */
router.post(
  "/regenerate",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const aiProfile = await regenerateAiProfile(userId);

      res.json({
        summary: aiProfile.summary,
        currentFocus: aiProfile.currentFocus,
        strengths: aiProfile.strengths,
        highlights: aiProfile.highlights,
        lastGenerated: aiProfile.lastGenerated,
        message: "AI profile regenerated successfully",
      });
    } catch (error) {
      console.error("Error regenerating AI profile:", error);
      res.status(500).json({ error: "Failed to regenerate AI profile" });
    }
  }
);

export default router;
