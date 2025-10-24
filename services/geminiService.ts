
import { GoogleGenAI, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeImage(prompt: string, imagePart: Part): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [ { text: prompt }, imagePart ] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    if (error instanceof Error) {
        return `Error analyzing image: ${error.message}`;
    }
    return "An unknown error occurred during image analysis.";
  }
}
