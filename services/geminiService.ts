import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult, UrgencyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHelpRequest = async (text: string): Promise<GeminiAnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze the following flood help request text. Determine the urgency level and extract key category tags (e.g., Food, Water, Medical, Evacuation, electricity). Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgency: {
              type: Type.STRING,
              enum: [UrgencyLevel.LOW, UrgencyLevel.MEDIUM, UrgencyLevel.HIGH, UrgencyLevel.CRITICAL],
              description: "The urgency of the situation based on keywords like 'pregnant', 'elderly', 'injured', 'trapped', 'water level rising fast'.",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of needs or categories.",
            },
          },
          required: ["urgency", "tags"],
        },
      },
    });

    const resultText = response.text;
    if (resultText) {
      return JSON.parse(resultText) as GeminiAnalysisResult;
    }
    throw new Error("Empty response from Gemini");

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback in case of error
    return { urgency: UrgencyLevel.HIGH, tags: ["Uncategorized"] };
  }
};