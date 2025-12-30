import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export const GeminiEmbeddingService = {
    /**
     * Generates embeddings using Google Gemini API
     * Model: text-embedding-004 (768 dimensions)
     */
    generateEmbedding: async (text: string): Promise<number[]> => {
        try {
            if (!text || !text.trim()) {
                console.log("ℹ️ No text to embed");
                return [];
            }

            console.log("🔮 Generating Gemini embedding...");

            // Use Gemini's embedding model
            const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

            const result = await model.embedContent(text);
            const embedding = result.embedding;

            console.log(`✅ Gemini embedding generated. Dimension: ${embedding.values.length}`);

            return Array.from(embedding.values);
        } catch (error: any) {
            console.error("❌ Error generating Gemini embedding:", error);
            console.error("   - Error message:", error.message);

            // Return empty array on error
            return [];
        }
    },

    /**
     * Creates a composite text string from user profile fields.
     */
    createUserProfileText: (user: any): string => {
        const parts = [
            user.interests?.join(", "),
            user.skills?.join(", "),
            user.role,
            user.primaryGoal,
            user.location,
        ].filter(Boolean);

        return parts.join(". ");
    },

    /**
     * Creates a composite text string from event fields.
     */
    createEventText: (event: any): string => {
        const parts = [
            event.name,
            event.headline,
            event.description,
            event.tags?.join(", "),
            event.location,
            event.pdfExtractedText // Include PDF content
        ].filter(Boolean);

        return parts.join(". ");
    }
};
