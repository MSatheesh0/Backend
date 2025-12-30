import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export interface EventRecommendation {
    eventId: string;
    isRecommended: boolean;
    matchScore: number; // 0-100
    reasoning: string;
}

export const GeminiRecommendationService = {
    /**
     * Analyzes if an event matches a user's profile using Gemini AI
     */
    analyzeEventMatch: async (
        userProfile: any,
        event: any
    ): Promise<EventRecommendation> => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            const prompt = `You are an intelligent event recommendation system. Analyze if this event matches the user's profile.

USER PROFILE:
- Name: ${userProfile.name}
- Role: ${userProfile.role || 'Not specified'}
- Primary Goal: ${userProfile.primaryGoal || 'Not specified'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}

EVENT DETAILS:
- Name: ${event.name}
- Headline: ${event.headline || 'Not specified'}
- Description: ${event.description}
- Tags: ${event.tags?.join(', ') || 'Not specified'}
- Location: ${event.location}
- Date: ${event.dateTime}

TASK:
1. Determine if this event is relevant and beneficial for this user
2. Consider: interests alignment, skill development, career goals, location proximity
3. Provide a match score (0-100) where:
   - 80-100: Highly recommended (strong alignment)
   - 60-79: Recommended (good alignment)
   - 40-59: Somewhat relevant (moderate alignment)
   - 0-39: Not recommended (weak/no alignment)

Respond in JSON format:
{
  "isRecommended": true/false,
  "matchScore": number (0-100),
  "reasoning": "Brief explanation (max 100 words) of why this event does or doesn't match"
}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Extract JSON from response (handle markdown code blocks)
            let jsonText = responseText.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }

            const analysis = JSON.parse(jsonText);

            return {
                eventId: event._id.toString(),
                isRecommended: analysis.isRecommended,
                matchScore: analysis.matchScore,
                reasoning: analysis.reasoning
            };
        } catch (error: any) {
            console.error("❌ Error analyzing event match:", error);
            // Fallback: return neutral recommendation
            return {
                eventId: event._id.toString(),
                isRecommended: true,
                matchScore: 50,
                reasoning: "Unable to analyze match. Showing event for your consideration."
            };
        }
    },

    /**
     * Batch analyze multiple events and return only recommended ones
     */
    filterRecommendedEvents: async (
        userProfile: any,
        events: any[],
        minScore: number = 60 // Only show events with 60+ score
    ): Promise<any[]> => {
        console.log(`🤖 AI analyzing ${events.length} events for recommendations...`);

        const recommendations = await Promise.all(
            events.map(event => GeminiRecommendationService.analyzeEventMatch(userProfile, event))
        );

        const recommendedEvents = events
            .map((event, index) => ({
                ...event,
                aiRecommendation: recommendations[index]
            }))
            .filter(event =>
                event.aiRecommendation.isRecommended &&
                event.aiRecommendation.matchScore >= minScore
            )
            .sort((a, b) => b.aiRecommendation.matchScore - a.aiRecommendation.matchScore);

        console.log(`✅ AI recommended ${recommendedEvents.length} out of ${events.length} events`);

        // Log recommendations
        recommendedEvents.forEach(event => {
            console.log(`   📌 "${event.name}" - Score: ${event.aiRecommendation.matchScore}/100`);
            console.log(`      Reason: ${event.aiRecommendation.reasoning.substring(0, 80)}...`);
        });

        return recommendedEvents;
    }
};
