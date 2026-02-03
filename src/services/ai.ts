// src/services/ai.ts
import type { UserPreferences, DayPlan } from '../types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateItinerary = async (prefs: UserPreferences): Promise<DayPlan[]> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your .env file.");
  }

  // Prompt Engineering: Meminta format JSON yang ketat
  const prompt = `
    Act as an expert travel planner. Create a ${prefs.days}-day trip itinerary for ${prefs.destination} with a ${prefs.budget} budget.
    The user is interested in: ${prefs.interests.join(", ")}.
    
    CRITICAL: Provide the response ONLY in valid JSON format without any markdown code blocks or additional text.
    The JSON structure must be exactly like this:
    [
      {
        "day": 1,
        "theme": "Arrival and City Exploration",
        "activities": [
          { "time": "Morning", "activity": "Name of place", "description": "Short details", "estimatedCost": "$10" },
          { "time": "Afternoon", "activity": "...", "description": "...", "estimatedCost": "..." },
          { "time": "Evening", "activity": "...", "description": "...", "estimatedCost": "..." }
        ]
      }
    ]
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tripgenie.app", // Wajib untuk OpenRouter
        "X-Title": "TripGenie"
      },
      body: JSON.stringify({
        model: "arcee-ai/trinity-large-preview:free", // Model yang bagus & hemat (atau bisa ganti gpt-3.5-turbo / gemini)
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from AI");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Bersihkan jika AI tidak sengaja mengirim markdown block (```json ... ```)
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(content);
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};