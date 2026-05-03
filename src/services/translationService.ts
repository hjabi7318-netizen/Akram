import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateToArabic(text: string): Promise<string> {
  if (!text || text.trim().length < 2) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `You are a professional translator for retail invoices. Translate the following product name from English into Modern Standard Arabic. 
Input: "${text}"
Output (Arabic only):` }] }],
    });

    const translated = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log(`Translated "${text}" -> "${translated}"`);
    return translated || "";
  } catch (error) {
    console.error("Translation failure for:", text, error);
    return ""; 
  }
}
