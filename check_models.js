const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env file");
    process.exit(1);
}

// Print first few chars to verify key change (masked)
console.log(`Using API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    // Standard Models (Preferred)
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-pro",

    // Experimental Models
    "gemini-2.0-flash-exp",
    "gemini-exp-1206"
];

async function testModels() {
    console.log("🔍 Testing Gemini models with current API key...\n");

    for (const modelName of modelsToTest) {
        try {
            process.stdout.write(`Testing ${modelName.padEnd(25)} ... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log("✅ WORKS!");
        } catch (error) {
            if (error.status === 429) {
                console.log("⚠️  QUOTA EXCEEDED (But exists!)");
            } else if (error.status === 404) {
                console.log("❌ NOT FOUND");
            } else {
                console.log(`❌ ERROR: ${error.status || error.message}`);
            }
        }
    }
}

testModels();
