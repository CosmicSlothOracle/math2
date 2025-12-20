
import { GoogleGenAI } from "@google/genai";

export async function getMatheHint(topic: string, question: string) {
  // Use recommended initialization with process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Du bist ein freundlicher Mathelehrer für 9. Klässler. Gib einen kurzen Tipp für folgende Frage zum Thema ${topic}: "${question}". 
      REGELN: 
      1. Verrate NIEMALS die direkte Lösung oder das Endergebnis.
      2. Erkläre das zugrundeliegende mathematische Prinzip.
      3. Hilf dem Schüler, den nächsten Denkschritt selbst zu finden.
      4. Maximal 3 Sätze.`,
      config: {
        temperature: 0.7,
        // Avoid setting maxOutputTokens without a thinkingBudget to prevent empty responses due to thinking consumption
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ups, der Mathelehrer ist gerade in der Pause. Versuch es nochmal!";
  }
}

export async function getTopicExplanation(topic: string) {
  // Use recommended initialization with process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Erkläre das mathematische Thema "${topic}" für einen 14-jährigen Schüler in einfacher Sprache. Nutze ein praktisches Alltagsbeispiel. Formatiere in Markdown. Gib keine Lösungen für spezifische Aufgaben.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Die Erklärung konnte nicht geladen werden.";
  }
}
