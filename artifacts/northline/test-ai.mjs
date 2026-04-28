import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGeminiAPI() {
  if (!GEMINI_API_KEY) {
    console.log("⏭️  Gemini API key not set, skipping Gemini test\n");
    return false;
  }

  try {
    console.log("🔍 Testing Gemini API...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You logged: writing (30 min), debugging (45 min), meeting (20 min). Provide 1 brief insight about this time usage.",
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.log(`✗ Gemini API error: ${response.status} ${response.statusText}`);
      console.log(`  Details: ${errorBody.substring(0, 200)}`);
      return false;
    }

    const data = await response.json();
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (insight) {
      console.log(`✓ Gemini API works!\n  Insight: "${insight}"\n`);
      return true;
    } else {
      console.log("✗ Gemini API returned empty response\n");
      return false;
    }
  } catch (error) {
    console.log(`✗ Gemini API error: ${error}\n`);
    return false;
  }
}

async function testGroqAPI() {
  if (!GROQ_API_KEY) {
    console.log("⏭️  Groq API key not set, skipping Groq test\n");
    return false;
  }

  try {
    console.log("🔍 Testing Groq API...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content:
              "You logged: writing (30 min), debugging (45 min), meeting (20 min). Provide 1 brief insight about this time usage.",
          },
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.log(`✗ Groq API error: ${response.status} ${response.statusText}`);
      console.log(`  Details: ${errorBody.substring(0, 200)}`);
      return false;
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content;

    if (insight) {
      console.log(`✓ Groq API works!\n  Insight: "${insight}"\n`);
      return true;
    } else {
      console.log("✗ Groq API returned empty response\n");
      return false;
    }
  } catch (error) {
    console.log(`✗ Groq API error: ${error}\n`);
    return false;
  }
}

async function runTests() {
  console.log("\n🧪 Testing Northline AI Integration\n");
  console.log("📋 API Keys detected:");
  console.log(`  Gemini: ${GEMINI_API_KEY ? "✓ Set" : "✗ Missing"}`);
  console.log(`  Groq: ${GROQ_API_KEY ? "✓ Set" : "✗ Missing"}\n`);

  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    console.error("❌ No API keys found. Ensure .env has GEMINI_API_KEY or GROQ_API_KEY\n");
    process.exit(1);
  }

  const geminiWorks = await testGeminiAPI();
  const groqWorks = await testGroqAPI();

  if (geminiWorks || groqWorks) {
    console.log("✅ AI integration is ready! At least one API is working.\n");
    process.exit(0);
  } else {
    console.log("❌ Both AI APIs failed. Check your API keys and network.\n");
    process.exit(1);
  }
}

runTests();
