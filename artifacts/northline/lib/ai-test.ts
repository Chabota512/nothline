import Constants from "expo-constants";
import * as ai from "./ai";
import type { ScheduledBlock } from "./types";

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey as string;
const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey as string;

// Mock logged blocks for testing
const testBlocks: ScheduledBlock[] = [
  {
    id: "test_1",
    date: "2024-01-01",
    startTime: new Date("2024-01-01 09:00").getTime(),
    endTime: new Date("2024-01-01 10:00").getTime(),
    status: "logged",
    primaryActivity: "Writing documentation",
  },
  {
    id: "test_2",
    date: "2024-01-01",
    startTime: new Date("2024-01-01 10:00").getTime(),
    endTime: new Date("2024-01-01 11:30").getTime(),
    status: "logged",
    primaryActivity: "Debugging API integration",
  },
  {
    id: "test_3",
    date: "2024-01-01",
    startTime: new Date("2024-01-01 11:30").getTime(),
    endTime: new Date("2024-01-01 12:00").getTime(),
    status: "logged",
    primaryActivity: "Coffee break and planning",
  },
  {
    id: "test_4",
    date: "2024-01-01",
    startTime: new Date("2024-01-01 14:00").getTime(),
    endTime: new Date("2024-01-01 16:00").getTime(),
    status: "logged",
    primaryActivity: "Code review session",
  },
  {
    id: "test_5",
    date: "2024-01-01",
    startTime: new Date("2024-01-01 16:00").getTime(),
    endTime: new Date("2024-01-01 17:00").getTime(),
    status: "logged",
    primaryActivity: "Team meeting",
  },
];

export async function testAIIntegration(): Promise<void> {
  console.log("🧪 Testing AI Integration...\n");

  console.log("📋 API Keys detected:");
  console.log(`  Gemini: ${GEMINI_API_KEY ? "✓ Set" : "✗ Missing"}`);
  console.log(`  Groq: ${GROQ_API_KEY ? "✓ Set" : "✗ Missing"}\n`);

  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    console.error("❌ No API keys configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env\n");
    return;
  }

  console.log("📊 Test data: 5 logged activities\n");

  try {
    console.log("⏳ Generating AI insights...\n");
    const insights = await ai.generateAIInsights(testBlocks);

    console.log("✅ AI Insights Generated:\n");
    insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}\n`);
    });

    console.log("🎉 AI integration is working!\n");
  } catch (error) {
    console.error(`❌ Error generating insights:`, error);
  }
}
