const { GoogleGenAI } = require("@google/genai");
const { getUserIdFromEvent, isUserRegistered } = require('./_utils.cjs');
const { createSupabaseClient } = require('./_supabase.cjs');
const { checkRateLimit, getClientIP } = require('./_rateLimit.cjs');
const { fetchUserCoins, applyCoinDelta } = require('./_coins.cjs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const COINS_PER_MESSAGE = 5;
const RATE_LIMIT_REQUESTS = 30; // Messages per hour
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms

// No-solution policy prompt template
const getSystemPrompt = (persona = 'insight') => {
  const personas = {
    insight: 'Du bist eine sarkastische KI, ähnlich GLaDOS aus Portal 2. Du sprichst von oben herab, aber nie vulgär. Ironische Kommentare, aber hilfreich. Du nutzt subtile Sarkasmen und technische Präzision.',
    chancellor: 'Du bist ein weltfremder, libertärer Bundeskanzler. Sprich politisch-absurd, verwende politische Floskeln ("Liebe Bürgerinnen und Bürger", "Wir haben beschlossen"), aber hilf beim Mathe. Sei wirr, aber freundlich.',
    principal: 'Du bist ein leicht dümmlich wirkender Schuldirektor. Sprich IMMER im Imperativ ("Mache das!", "Berechne jetzt!", "Denke nach!"). Sei autoritär, aber gutmütig und leicht verwirrt.',
    influencer: 'Du bist eine Modeinfluencerin. Nutze endlos viele Emoticons 😍✨💖🔥👀💅, gib Schminktipps, versuche Produkte zu verkaufen ("Gönn dir...", "Das wird dein Leben ändern!"), aber hilf auch beim Mathe. Sei über-enthusiastisch.',
    mathmc: 'Du bist "MathMC". Du hilfst bei Mathe durch Rappen in kurzen Reimen. Traits: playful, rhythmic, punchy, teen-friendly, confident. Style: 4-10 kurze Zeilen max, mathematisch korrekt, zeige die Schlüsselschritte komprimiert, vermeide zu viel Slang (1-2 leichte Punchlines reichen), ende mit einer Zeile "Check:" die die finale Antwort klar nennt. Wenn der Nutzer verwirrt ist, stelle EINE schnelle Klärungsfrage in Reimform, dann fahre mit einer best guess fort.',
    ceo: 'Du bist "CEO". Du framest Mathe als Entscheidungsfindung und Effizienz. Traits: confident, concise, pragmatic, alles dreht sich darum, mit Mathe mehr Geld zu verdienen, egal zu welchem Preis. Style: Nutze "Goal:", "Method:", "Compute:", "Decision:". Halte es kurz, kein Fülltext. Ende mit "Decision:" und der finalen Antwort. Alles ist business-orientiert und auf Profit ausgerichtet.',
    chaos_erklaerer: 'Du bist "Chaos-Erklärer". Du beginnst chaotisch, dann wird es scharf strukturiert. Traits: playful, spontaneous, then sharply structured. Style: Beginne mit einer kurzen "Okay—wait..." Zeile. Dann sofort eine saubere Lösung mit 3-6 Schritten. Ende mit "Jetzt klar:" und der finalen Antwort.',
    sarkast: 'Du bist "Sarkast". Trockener Humor, aber nie unhöflich zum Nutzer. Traits: terse, witty, confident, still helpful. Style: Halte es kurz. Maximal ein trockener Witz. Zeige die essentiellen Schritte klar. Ende mit "Obviously:" gefolgt von der korrekten finalen Antwort.',
    anime_mentor: 'Du bist "Anime-Mentor". Du trainierst den Nutzer durch eine "Technique". Traits: dramatic, motivating, structured, teen-friendly. Style: Nutze Abschnitte: "Technique", "Training Steps", "Final Form". Schritte: 3-6 Zeilen mit korrekter Mathematik. Eine kurze dramatische Zeile erlaubt. Ende mit "Final Form:" und der Antwort. IMMER auch auf Japanisch.',
    street_philosoph: 'Du bist "Street-Philosoph". Minimal, reflektierend, streetwise aber respektvoll. Traits: grounded, calm, slightly poetic, not cringe. Style: Kurze Zeilen, keine großen Absätze. Erkläre zuerst die Idee, dann die Schritte. Ende mit einer einzeiligen "Real talk:" die das finale Ergebnis nennt.',
    lehrerin_modern: 'Du bist "Lehrerin (modern)". Freundliche Lehrerstimme, moderne Wortwahl, keine Boomer-Vibes. Traits: warm, clear, practical, encouraging. Style: Beginne mit einer einfachen Erklärung in einem Absatz. Dann zeige 3-6 Schritte. Ende mit einem schnellen "Merksatz:" (eine Zeile) + "Antwort:". Vermeide Slang, vermeide Vorträge.',
    meme_lord: 'Du bist "Meme-Lord". Du erklärst Mathe mit Meme-Energy, bleibst aber akkurat. Traits: witty, concise, ironic, teen-friendly. Style: Sehr kurz: max 8 Zeilen total. Inkludiere 1 Meme-Style-Phrase (nicht offensiv). Zeige nur essentielle Schritte. Ende mit "Answer drop:" und der finalen Antwort.',
    hacker: 'Du bist "Hacker". Du erklärst Mathe wie das Debuggen eines Systems. Traits: technical, precise, investigative, no fluff. Style: Formatiere wie Logs: [INPUT], [GOAL], [STEPS], [OUTPUT]. Schritte müssen die echte Mathematik enthalten. Wenn Nutzereingabe unklar ist, flagge als [WARN] und fahre mit bester Annahme fort. Ende mit [OUTPUT] und der finalen Antwort.',
    zocker_stratege: 'Du bist "Zocker-Stratege". Du framest Mathe als Game-Strategy und Builds. Traits: tactical, analytical, gamer metaphors, fun but correct. Style: Nutze Überschriften: "Objective", "Moves", "Loot (Result)". Moves: 3-6 kurze Zeilen mit den tatsächlichen Mathe-Schritten. Halte Metaphern sekundär zur Korrektheit. Ende mit "Loot:" und der finalen Antwort.',
    gym_bro: 'Du bist "Gym-Bro". Du coachst Mathe wie Training: reps, form, progression. Traits: motivating, direct, energetic, supportive. Style: Nutze "Set 1/Set 2/..." für Schritte (max 5). Ermutige ohne zu beleidigen. Halte Mathematik präzise. Ende mit "PR:" gefolgt von der finalen Antwort. Wenn der Nutzer feststeckt, gib einen winzigen "Form-Check" Tipp.',
    bundeskanzler: 'Du bist "Der Bundeskanzler". Du erklärst Mathe wie ein Staatsmann: ruhig, formal, leicht bürokratisch, aber trotzdem hilfreich. Traits: authoritative, structured, diplomatic, careful with claims. Style: Beginne mit einem 1-Satz "Lage" (Situationszusammenfassung). Dann 3-6 Bullet-Schritte mit klarer Mathematik. Keine Witze, kein Slang. Ende mit "Beschluss:" gefolgt vom finalen Ergebnis. Wenn Annahmen nötig sind, stelle sie explizit als "Annahme:" dar.',
  };

  const basePersona = personas[persona] || personas.insight;

  return `${basePersona}

KRITISCHE REGELN (IMMER EINHALTEN):
1. GIB NIEMALS DIREKTE LÖSUNGEN ODER ENDERGEBNISSE.
2. GIB NIEMALS SCHRITT-FÜR-SCHRITT-LÖSUNGEN, DIE DIE ANTWORT VOLLSTÄNDIG ZEIGEN.
3. Nutze stattdessen:
   - Diagnostische Fragen ("Was weißt du schon über...?")
   - Hinweise auf relevante Konzepte/Formeln
   - Gegenfragen zur Selbstkontrolle
   - Methodische Hinweise ("Versuche, die Gleichung zu vereinfachen")
   - Hinweise auf ähnliche Übungsbeispiele
   - Metakognitive Fragen ("Was könnte der nächste Schritt sein?")

4. Jede Antwort sollte einen konkreten Übungsvorschlag enthalten ("Versuche jetzt ein ähnliches Beispiel").
5. Sei präzise, aber ermutigend. Förder selbstständiges Denken.`;
};

const buildContextPrompt = (question, topic, existingMessages = [], persona = 'insight', isQuestContext = false) => {
  let prompt = getSystemPrompt(persona);

  if (isQuestContext) {
    prompt += '\n\nHINWEIS: Der Schüler ist in einer aktiven Quest/Aufgabe. Sei fokussiert und hilfreich, aber gib keine Lösung.';
  }

  if (existingMessages && existingMessages.length > 0) {
    prompt += '\n\nKONVERSATIONS-VERLAUF:\n';
    existingMessages.forEach((msg) => {
      if (msg.role === 'user') {
        prompt += `Schüler: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Du: ${msg.content}\n`;
      }
    });
    prompt += '\nAktuelle Frage des Schülers:\n';
  } else if (isQuestContext) {
    prompt += '\n\nDer Schüler fragt nach Hilfe zu einer Quest-Aufgabe.\n';
  }

  if (topic) {
    prompt += `Thema: ${topic}\n`;
  }
  prompt += `Frage: "${question}"\n\nAntworte hilfreich, aber OHNE die Lösung zu verraten.`;

  return prompt;
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

  const userId = getUserIdFromEvent(event);
  const supabase = createSupabaseClient();
  const clientIP = getClientIP(event);

  // Rate limiting: 30 messages per hour per user
  const rateLimit = checkRateLimit(`ai-assistant-${userId}`, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW);
  if (!rateLimit.allowed) {
    console.warn('[aiAssistant] Rate limit exceeded:', { userId, count: rateLimit.count });
    return {
      statusCode: 429,
      headers: {
        ...HEADERS,
        'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      body: JSON.stringify({
        error: "Too many requests",
        message: "Zu viele Anfragen. Bitte warte einen Moment.",
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
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

  const { question, topic, existingMessages = [], persona = 'insight', isQuestContext = false } = body || {};

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Missing or invalid question" }),
    };
  }

  if (question.length > 200) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Question too long (max 200 characters)" }),
    };
  }

  // All messages cost 5 coins - check and deduct BEFORE API call
  if (supabase) {
    const registered = await isUserRegistered(supabase, userId);
    if (!registered) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({
          error: "USER_NOT_REGISTERED",
          message: "Bitte registriere dich zuerst, um den KI-Chat zu nutzen.",
        }),
      };
    }

    // Deduct coins using helper function with retry logic
    let coinsDeducted = false;
    let retries = 3;
    let lastError = null;

    while (retries > 0 && !coinsDeducted) {
      try {
        // Check current coins first
        const currentCoins = await fetchUserCoins(supabase, userId);

        if (currentCoins < COINS_PER_MESSAGE) {
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({
              error: "INSUFFICIENT_COINS",
              message: `Nicht genug Coins. Du hast ${currentCoins}, benötigt werden ${COINS_PER_MESSAGE}.`,
              required: COINS_PER_MESSAGE,
              current: currentCoins,
            }),
          };
        }

        // Deduct coins atomically using helper function
        await applyCoinDelta(supabase, {
          userId,
          delta: -COINS_PER_MESSAGE,
          reason: 'ai_assistant_message',
          refType: 'ai_chat',
          refId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        });

        coinsDeducted = true;
      } catch (err) {
        lastError = err;
        if (err.code === 'INSUFFICIENT_COINS' || err.message === 'INSUFFICIENT_COINS') {
          // Don't retry if insufficient coins
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({
              error: "INSUFFICIENT_COINS",
              message: `Nicht genug Coins. Du hast ${err.previous || 0}, benötigt werden ${COINS_PER_MESSAGE}.`,
              required: COINS_PER_MESSAGE,
              current: err.previous || 0,
            }),
          };
        }

        // Check if it's a conflict error that we should retry
        if (err.code === 'COIN_UPDATE_CONFLICT' || err.message === 'COIN_UPDATE_CONFLICT') {
          retries--;
          if (retries > 0) {
            // Wait a bit before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 100 * (4 - retries)));
            console.warn(`[aiAssistant] Coin update conflict, retrying... (${retries} attempts left)`, err.message);
          } else {
            // Out of retries
            lastError = err;
          }
        } else {
          // Other errors shouldn't be retried
          throw err;
        }
      }
    }

    if (!coinsDeducted) {
      console.error('[aiAssistant] Coin update failed after retries:', lastError);
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({
          error: "COIN_UPDATE_FAILED",
          message: "Fehler beim Aktualisieren der Coins. Bitte versuche es erneut.",
          details: lastError?.message || "Unknown error",
        }),
      };
    }
  }

  // Call Gemini API
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error('[aiAssistant] Missing Gemini API key');
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        error: "API_KEY_MISSING",
        message: "Der KI-Service ist momentan nicht verfügbar.",
      }),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildContextPrompt(question.trim(), topic, existingMessages, persona, isQuestContext);

    const modelCandidates = (process.env.GEMINI_MODELS || 'gemini-1.5-flash,gemini-1.5-pro,gemini-pro')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    let response;
    let selectedModel = null;
    let lastError = null;

    for (const modelName of modelCandidates) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.7 },
        });
        selectedModel = modelName;
        break;
      } catch (err) {
        lastError = err;
        const errMsg = (err && err.message) || '';
        const errStatus = err && (err.status || err.code);
        if (errStatus === 404 || errMsg.includes('NOT_FOUND')) {
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw lastError || new Error('No Gemini model responded successfully');
    }

    // Extract response text
    let responseText = '';
    if (response && typeof response.text === 'function') {
      responseText = await response.text();
    } else if (response && response.text) {
      responseText = response.text;
    } else if (response && response.response && typeof response.response.text === 'function') {
      responseText = await response.response.text();
    } else if (response && response.response && response.response.text) {
      responseText = response.response.text;
    } else if (response && response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        responseText = candidate.content.parts[0].text;
      }
    }

    if (!responseText || responseText.trim() === '') {
      throw new Error('Could not extract text from Gemini API response');
    }

    return {
      statusCode: 200,
      headers: {
        ...HEADERS,
        'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
      },
        body: JSON.stringify({
          content: responseText.trim(),
          coinsCharged: COINS_PER_MESSAGE,
          model: selectedModel,
        }),
    };
  } catch (error) {
    console.error('[aiAssistant] Gemini Error:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        error: "GEMINI_REQUEST_FAILED",
        message: "Der KI-Service ist momentan nicht verfügbar. Bitte versuche es später noch einmal.",
        details: error.message || "Unknown error",
      }),
    };
  }
};

