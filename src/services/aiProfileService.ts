import { AiProfile } from "../models/AiProfile";
import { User } from "../models/User";
import { Goal } from "../models/Goal";
import { UserDocument } from "../models/Document";
import mongoose from "mongoose";

/**
 * Generate AI profile content based on user data
 */
export const generateAiProfile = async (
  userId: string
): Promise<{
  summary: string;
  currentFocus: string[];
  strengths: string[];
  highlights: string[];
}> => {
  console.log(`Debug: Generating AI profile for userId: ${userId}`);

  // Get user data
  const user = await User.findById(userId);
  console.log(`Debug: User data fetched:`, user);

  if (!user) {
    console.error(`Error: User not found for userId: ${userId}`);
    throw new Error("User not found");
  }

  // Get user's active goals
  const activeGoals = await Goal.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: "active",
  }).limit(5);

  // Get document count
  const documentCount = await UserDocument.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
  });

  // Generate AI content based on user data
  // TODO: Replace with actual AI service (OpenAI, Anthropic, etc.)
  const summary = generateSummary(user, activeGoals.length, documentCount);
  const currentFocus = generateCurrentFocus(user, activeGoals);
  const strengths = generateStrengths(user);
  const highlights = generateHighlights(user, activeGoals);

  return {
    summary,
    currentFocus,
    strengths,
    highlights,
  };
};

/**
 * Generate user summary
 */
function generateSummary(
  user: any,
  goalsCount: number,
  _documentCount: number
): string {
  const role = user.role || "professional";
  const goal = user.primaryGoal || "growth";
  const company = user.company ? ` at ${user.company}` : "";
  const location = user.location ? ` based in ${user.location}` : "";

  let summary = `${
    role.charAt(0).toUpperCase() + role.slice(1)
  }${company}${location}`;

  if (user.oneLiner) {
    summary += `. ${user.oneLiner}`;
  }

  if (goalsCount > 0) {
    summary += ` Currently working on ${goalsCount} active goal${
      goalsCount > 1 ? "s" : ""
    }`;
  }

  if (user.primaryGoal) {
    summary += ` with focus on ${goal}`;
  }

  return summary + ".";
}

/**
 * Generate current focus areas
 */
function generateCurrentFocus(user: any, activeGoals: any[]): string[] {
  const focus: string[] = [];

  // Add primary goal
  if (user.primaryGoal) {
    const goalMap: { [key: string]: string } = {
      fundraising: "Raising funding for growth",
      clients: "Acquiring new clients and customers",
      cofounder: "Finding the right co-founder",
      hiring: "Building and scaling the team",
      learn: "Learning and skill development",
      other: "Achieving key business objectives",
    };
    focus.push(goalMap[user.primaryGoal] || goalMap.other);
  }

  // Add top 2 active goals
  activeGoals.slice(0, 2).forEach((goal) => {
    focus.push(goal.title);
  });

  // If no focus areas, add default
  if (focus.length === 0) {
    focus.push("Setting up profile and defining goals");
  }

  return focus.slice(0, 3); // Max 3 focus areas
}

/**
 * Generate strengths
 */
function generateStrengths(user: any): string[] {
  const strengths: string[] = [];

  const roleStrengths: { [key: string]: string[] } = {
    founder: [
      "Entrepreneurship",
      "Product Development",
      "Team Building",
      "Strategic Planning",
    ],
    investor: [
      "Investment Analysis",
      "Portfolio Management",
      "Due Diligence",
      "Market Insights",
    ],
    mentor: [
      "Mentorship",
      "Strategic Guidance",
      "Industry Expertise",
      "Network Building",
    ],
    cxo: [
      "Executive Leadership",
      "Strategic Planning",
      "Operations Management",
      "Business Development",
    ],
    service: [
      "Consulting",
      "Problem Solving",
      "Client Relations",
      "Project Management",
    ],
    other: ["Professional Skills", "Industry Knowledge", "Collaboration"],
  };

  const role = user.role || "other";
  strengths.push(...(roleStrengths[role] || roleStrengths.other).slice(0, 3));

  return strengths;
}

/**
 * Generate highlights
 */
function generateHighlights(user: any, activeGoals: any[]): string[] {
  const highlights: string[] = [];

  // Company highlight
  if (user.company) {
    const role = user.role || "professional";
    highlights.push(
      `${role.charAt(0).toUpperCase() + role.slice(1)} at ${user.company}`
    );
  }

  // Location highlight
  if (user.location) {
    highlights.push(`Based in ${user.location}`);
  }

  // Goals highlight
  if (activeGoals.length > 0) {
    const completedMilestones = activeGoals.reduce(
      (sum, goal) =>
        sum + goal.milestones.filter((m: any) => m.completed).length,
      0
    );
    if (completedMilestones > 0) {
      highlights.push(
        `Completed ${completedMilestones} milestone${
          completedMilestones > 1 ? "s" : ""
        }`
      );
    }
  }

  // Website highlight
  if (user.website) {
    highlights.push(`Portfolio: ${user.website}`);
  }

  // Default if no highlights
  if (highlights.length === 0) {
    highlights.push("Active on GoalNet");
  }

  return highlights.slice(0, 4); // Max 4 highlights
}

/**
 * Get or create AI profile for user
 */
export const getAiProfile = async (userId: string) => {
  console.log(`Debug: Getting AI profile for userId: ${userId}`);
  console.log(`Debug: userId type: ${typeof userId}`);

  // Try to find AI profile using $or query to handle both string and ObjectId
  let aiProfile = await AiProfile.findOne({
    $or: [
      { userId: userId }, // Try as string
      {
        userId: mongoose.Types.ObjectId.isValid(userId)
          ? new mongoose.Types.ObjectId(userId)
          : null,
      }, // Try as ObjectId
    ],
  });

  console.log(`Debug: AI profile found:`, aiProfile ? "Yes" : "No");
  if (aiProfile) {
    console.log(
      `Debug: Found AI profile userId type:`,
      typeof aiProfile.userId
    );
  }

  if (!aiProfile) {
    console.log(`Debug: No existing AI profile found, generating new one`);
    // Generate new AI profile
    const content = await generateAiProfile(userId);
    aiProfile = await AiProfile.create({
      userId: userId, // Store as string to match existing data
      ...content,
    });
  } else {
    console.log(`Debug: Returning existing AI profile`);
  }

  return aiProfile;
};

/**
 * Regenerate AI profile
 */
export const regenerateAiProfile = async (userId: string) => {
  const content = await generateAiProfile(userId);

  const aiProfile = await AiProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      ...content,
      lastGenerated: new Date(),
    },
    { new: true, upsert: true }
  );

  return aiProfile;
};
