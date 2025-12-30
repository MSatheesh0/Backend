// Test script to list available Gemini models
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        console.log("🔍 Fetching available Gemini models...\n");

        // Try to list models
        const models = await genAI.listModels();

        console.log("✅ Available models:");
        models.forEach((model: any) => {
            console.log(`\n📌 ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(", ")}`);
        });

    } catch (error: any) {
        console.error("❌ Error listing models:", error.message);

        // Try common free models
        console.log("\n🔄 Testing common free models...\n");

        const modelsToTest = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro-latest",
            "gemini-flash",
            "gemini-pro-vision",
            "models/gemini-1.5-flash",
            "models/gemini-pro"
        ];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ ${modelName} - WORKS!`);
            } catch (err: any) {
                console.log(`❌ ${modelName} - ${err.status || 'Error'}`);
            }
        }
    }
}

listModels();
