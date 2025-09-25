// Corrected gemini.js

import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // 🚨 FIX: Return the generated text content
    return response.text; 

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Throw the error so the controller's catch block can handle it
    throw new Error("Failed to communicate with the AI service."); 
  }
}

export default main;