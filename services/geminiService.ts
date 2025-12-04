import { GoogleGenAI, Type } from "@google/genai";
import { RiddleData } from '../types';

// Initialize the Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRiddle = async (): Promise<RiddleData> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = "Generate a clever, challenging riddle with a single-word answer. The answer should be a common object or concept.";
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { 
              type: Type.STRING, 
              description: "The riddle text itself." 
            },
            answer: { 
              type: Type.STRING, 
              description: "The single word answer." 
            },
            hint: { 
              type: Type.STRING, 
              description: "A subtle hint to help the user if they are stuck." 
            }
          },
          required: ["question", "answer", "hint"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as RiddleData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback riddle in case of API failure or quota issues
    return {
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answer: "Echo",
      hint: "It involves sound reflection."
    };
  }
};
