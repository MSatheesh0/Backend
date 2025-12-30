const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    "gemini-1.5-flash-8b",         // Standard 8b
    "gemini-1.5-flash-8b-exp-0827", // Experimental 8b
    "gemini-1.5-flash-8b-exp-0924",
    "learnlm-1.5-pro-experimental", // Educational model (often free)
    "gemini-2.0-flash-exp"          // Existing fallback
];

async function testModels() {
    console.log("🔍 Testing ALTERNATIVE models...\n");

    for (const modelName of modelsToTest) {
        try {
            process.stdout.write(`Testing ${modelName.padEnd(30)} ... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log("✅ WORKS!");
        } catch (error) {
            if (error.status === 429) {
                console.log("⚠️  QUOTA EXCEEDED");
            } else if (error.status === 404) {
                console.log("❌ NOT FOUND");
            } else {
                console.log(`❌ ERROR: ${error.status || error.message}`);
            }
        }
    }
}

testModels();
