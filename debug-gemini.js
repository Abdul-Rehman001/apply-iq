const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function debugModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env.local");
    return;
  }

  console.log("🔍 Checking available models for your API key...");
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Note: The listModels method might not be directly on genAI in all SDK versions, 
    // but we can try to find what's available.
    // However, the best way is often just to try a known stable one with v1.
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✅ Model 'gemini-1.5-flash' initialized.");
    
    // Test a very simple prompt
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log("✅ Test successful! AI says:", response.text());
  } catch (error) {
    console.error("❌ Error during test:", error);
    if (error.message.includes("404")) {
      console.log("\n💡 suggestion: Your API key might not have access to 'gemini-1.5-flash'.");
      console.log("Trying 'gemini-pro' as fallback...");
      try {
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Say hello");
        console.log("✅ 'gemini-pro' works!");
      } catch (err) {
        console.error("❌ 'gemini-pro' also failed:", err.message);
      }
    }
  }
}

debugModels();
