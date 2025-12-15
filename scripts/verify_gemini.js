
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

async function verifyGemini() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ Error: GEMINI_API_KEY is missing in .env file");
        process.exit(1);
    }

    console.log(`ℹ️ Testing Gemini API with key: ${apiKey.substring(0, 4)}...${apiKey.slice(-4)}`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const text = "Hello world, this is a test embedding.";
        console.log(`ℹ️ Generating embedding for: "${text}"`);

        const result = await model.embedContent(text);
        const embedding = result.embedding;

        if (!embedding || !embedding.values || embedding.values.length === 0) {
            console.error("❌ Error: API returned empty embedding.");
            process.exit(1);
        }

        console.log("✅ Success! Embedding generated.");
        console.log(`   Dimensions: ${embedding.values.length}`);

        if (embedding.values.length === 768) {
            console.log("✅ Dimensions match MongoDB configuration (768).");
        } else {
            console.warn(`⚠️ Warning: Dimensions (${embedding.values.length}) do NOT match 768. Check model version.`);
        }

    } catch (error) {
        console.error("❌ API Call Failed:");
        if (error.message) console.error(`   Message: ${error.message}`);
        process.exit(1);
    }
}

verifyGemini();
