const { GoogleGenAI } = require("@google/genai");
const { getUserIdFromEvent, isUserRegistered } = require('./_utils.cjs');
const { createSupabaseClient } = require('./_supabase.cjs');
const { checkRateLimit, getClientIP, shouldBlockByUserAgent } = require('./_rateLimit.cjs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // 1. Bot detection via User-Agent
  if (shouldBlockByUserAgent(event)) {
    console.warn('[hint] Blocked bot request:', event.headers['user-agent'] || 'no-user-agent');
    return {
      statusCode: 403,
      headers: HEADERS,
      body: JSON.stringify({
        error: "Forbidden",
        hint: "Der Tipp-Service steht nur registrierten Nutzern zur Verfügung."
      }),
    };
  }

  // 2. Rate limiting (10 requests per minute per IP)
  const clientIP = getClientIP(event);
  const rateLimit = checkRateLimit(clientIP, 10, 60000); // 10 requests per 60 seconds

  if (!rateLimit.allowed) {
    console.warn('[hint] Rate limit exceeded:', { clientIP, count: rateLimit.count });
    return {
      statusCode: 429,
      headers: {
        ...HEADERS,
        'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
      },
      body: JSON.stringify({
        error: "Too many requests",
        hint: "Bitte warte einen Moment und versuche es dann erneut.",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { topic, question } = body || {};
  if (!topic || !question) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Missing topic or question" }),
    };
  }

  // 3. Require user registration for expensive operations
  const userId = getUserIdFromEvent(event);
  const supabase = createSupabaseClient();

  // In dev mode without Supabase, allow access (graceful degradation)
  if (supabase) {
    const registered = await isUserRegistered(supabase, userId);
    if (!registered) {
      console.warn('[hint] Unregistered user attempt:', userId);
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({
          error: "USER_NOT_REGISTERED",
          hint: "Bitte registriere dich zuerst, um den Tipp-Service zu nutzen.",
          message: "Registration required"
        }),
      };
    }
  } else {
    console.warn('[hint] Dev mode - registration check skipped (Supabase unavailable)');
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("Missing API key. Available env vars:", Object.keys(process.env).filter(k => k.includes('API') || k.includes('GEMINI')));
    // Return graceful error message instead of 500 error
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        hint: "Der Tipp-Service ist momentan nicht verfügbar. Bitte versuche es später noch einmal oder frage deinen Lehrer um Hilfe.",
        error: "Missing Gemini API key"
      }),
    };
  }

  console.log('[hint] Processing request:', { userId, clientIP, topic, questionLength: question?.length });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Du bist ein freundlicher Mathelehrer für 9. Klässler. Gib einen kurzen Tipp für folgende Frage zum Thema ${topic}: "${question}".
REGELN:
1. Verrate NIEMALS die direkte Lösung oder das Endergebnis.
2. Erkläre das zugrundeliegende mathematische Prinzip.
3. Hilf dem Schüler, den nächsten Denkschritt selbst zu finden.
4. Maximal 3 Sätze.`;

    // gemini-pro is deprecated/not available - removed from default list
    const preferredModelsEnv =
      process.env.GEMINI_MODELS ||
      'gemini-1.5-flash,gemini-1.5-pro';
    const modelCandidates = preferredModelsEnv
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    let response;
    let selectedModel = null;
    let lastError = null;

    for (const modelName of modelCandidates) {
      try {
        console.log(`[hint] Trying Gemini model "${modelName}"`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          config: { temperature: 0.7 },
        });
        selectedModel = modelName;
        break;
      } catch (err) {
        lastError = err;
        const errMsg = (err && err.message) || '';
        const errStatus = err && (err.status || err.code);
        console.warn(`[hint] Model ${modelName} failed`, errMsg || errStatus || err);
        if (errStatus === 404 || errMsg.includes('NOT_FOUND')) {
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw lastError || new Error('No Gemini model responded successfully');
    }

    // Die GoogleGenAI API gibt die Antwort zurück - verschiedene mögliche Strukturen prüfen
    let hintText;

    // Logging für Debugging
    console.log("Response type:", typeof response);
    console.log("Response keys:", response ? Object.keys(response) : 'null');
    console.log("Selected model:", selectedModel);

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
        ...HEADERS,
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
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
      headers: HEADERS,
      body: JSON.stringify({
        error: "Gemini request failed",
        details: error.message || "Unknown error",
        hint: "Der Tipp-Service ist momentan nicht verfügbar. Bitte versuche es später noch einmal."
      }),
    };
  }
};
