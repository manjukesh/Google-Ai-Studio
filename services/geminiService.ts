import { GoogleGenAI } from "@google/genai";
import { Paksha } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTithiInsight = async (tithiName: string, paksha: Paksha, degree: number) => {
  try {
    const prompt = `
      Analyze the specific lunar phase (Tithi) in Vedic Astrology.
      
      Details:
      - Tithi Name: ${tithiName}
      - Paksha: ${paksha} (Shukla = Waxing, Krishna = Waning)
      - Current Lunar Elongation: ${degree.toFixed(2)} degrees

      Please provide a short, culturally rich, and astronomical description of this specific phase. 
      Include:
      1. Its spiritual significance.
      2. Recommended activities (good for/bad for).
      3. A brief metaphor about the moon's light at this stage.

      Keep the response under 150 words. Format as plain text or Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert, wise Vedic Astronomer and Poet.",
        temperature: 0.7,
      }
    });

    return response.text || "Unable to fetch cosmic insights at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The stars are silent (API Error). Please try again.";
  }
};
