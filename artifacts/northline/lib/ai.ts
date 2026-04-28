import Constants from "expo-constants";
import type { ScheduledBlock } from "./types";

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey as string;
const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey as string;

interface AIResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data: AIResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return null;
  }
}

async function callGroq(prompt: string): Promise<string | null> {
  if (!GROQ_API_KEY) return null;

  try {
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
            content: prompt,
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

    const data: AIResponse = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error("Groq API call failed:", error);
    return null;
  }
}

export async function generateAIInsights(blocks: ScheduledBlock[]): Promise<string[]> {
  const loggedBlocks = blocks.filter((b) => b.status === "logged");
  if (loggedBlocks.length < 5) {
    return ["Log a few more blocks for AI-powered insights."];
  }

  const activities = loggedBlocks
    .map((b) => `${b.primaryActivity || "Unknown"} (${Math.round((b.endTime - b.startTime) / 60000)} min)`)
    .join(", ");

  const prompt = `Based on this week's logged activities: ${activities}. Provide 2-3 brief, helpful, non-judgmental insights about time usage patterns. Focus on self-awareness and positive suggestions. Keep each insight under 100 characters.`;

  let insights: string[] = [];

  // Try Gemini first
  const geminiResponse = await callGemini(prompt);
  if (geminiResponse) {
    insights = geminiResponse
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 3);
  }

  // Fallback to Groq if Gemini failed
  if (insights.length === 0) {
    const groqResponse = await callGroq(prompt);
    if (groqResponse) {
      insights = groqResponse
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 3);
    }
  }

  // Final fallback to rule-based
  if (insights.length === 0) {
    return ["AI insights unavailable—check your connection."];
  }

  return insights;
}