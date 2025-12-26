const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: "Missing topic or question" }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("Missing API key. Available env vars:", Object.keys(process.env).filter(k => k.includes('API') || k.includes('GEMINI')));
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
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

    // Die GoogleGenAI API gibt die Antwort zurück - verschiedene mögliche Strukturen prüfen
    let hintText;

    // Logging für Debugging
    console.log("Response type:", typeof response);
    console.log("Response keys:", response ? Object.keys(response) : 'null');

    // Versuche verschiedene Response-Strukturen
    if (response && typeof response.text === 'function') {
      // response.text() ist eine Funktion
      hintText = await response.text();
    } else if (response && response.text && typeof response.text === 'string') {
      // response.text ist direkt ein String
      hintText = response.text;
    } else if (response && response.response && typeof response.response.text === 'function') {
      // response.response.text() ist eine Funktion
      hintText = await response.response.text();
    } else if (response && response.response && response.response.text) {
      // response.response.text ist ein String
      hintText = response.response.text;
    } else if (response && response.candidates && response.candidates[0]) {
      // Standard Gemini API Struktur
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        hintText = candidate.content.parts[0].text;
      }
    }

    // Falls immer noch kein Text gefunden wurde
    if (!hintText || hintText.trim() === '') {
      console.error("Could not extract text from response. Full response:", JSON.stringify(response, null, 2));
      throw new Error("Could not extract text from Gemini API response");
    }

    console.log("Successfully extracted hint text:", hintText.substring(0, 100) + "...");

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ hint: hintText }),
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: "Gemini request failed",
        details: error.message || "Unknown error",
      }),
    };
  }
};
