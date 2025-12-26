const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { topic, question } = body || {};
  if (!topic || !question) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing topic or question" }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Gemini API key" }),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Du bist ein freundlicher Mathelehrer für 9. Klässler. Gib einen kurzen Tipp für folgende Frage zum Thema ${topic}: \"${question}\".\nREGELN:\n1. Verrate NIEMALS die direkte Lösung oder das Endergebnis.\n2. Erkläre das zugrundeliegende mathematische Prinzip.\n3. Hilf dem Schüler, den nächsten Denkschritt selbst zu finden.\n4. Maximal 3 Sätze.`,
      config: {
        temperature: 0.7,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ hint: response.text }),
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gemini request failed" }),
    };
  }
};
