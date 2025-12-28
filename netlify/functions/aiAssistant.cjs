const { GoogleGenAI } = require("@google/genai");
const { getUserIdFromEvent, isUserRegistered } = require('./_utils.cjs');
const { createSupabaseClient } = require('./_supabase.cjs');
const { checkRateLimit, getClientIP } = require('./_rateLimit.cjs');

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
const getSystemPrompt = (persona = 'default') => {
  const personas = {
    default: 'Du bist ein freundlicher, geduldiger Mathelehrer für Schüler der 9. Klasse bis Abitur.',
    tutor: 'Du bist eine freundliche Tutorin, die Schülerinnen und Schülern mit Geduld und Klarheit hilft.',
    coach: 'Du bist ein motivierender Mathe-Coach, der Schüler zum selbstständigen Denken anleitet.',
  };

  const basePersona = personas[persona] || personas.default;

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

const buildContextPrompt = (question, topic, existingMessages = [], persona = 'default') => {
  let prompt = getSystemPrompt(persona);

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
  // Try persistent rate-limit via Supabase table `ai_rate_limits` if available.
  // Fallback to in-memory rate limiter on error or missing table.
  let rateLimitInfo = null;
  try {
    if (supabase) {
      const { data: rlRows, error: rlErr } = await supabase
        .from('ai_rate_limits')
        .select('count, reset_at')
        .eq('user_id', userId)
        .limit(1);

      if (rlErr) throw rlErr;

      const now = Date.now();
      if (!rlRows || rlRows.length === 0) {
        const resetAt = new Date(now + RATE_LIMIT_WINDOW).toISOString();
        await supabase.from('ai_rate_limits').insert({ user_id: userId, count: 1, reset_at: resetAt });
        rateLimitInfo = { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW, count: 1 };
      } else {
        const row = rlRows[0];
        const rowResetAt = new Date(row.reset_at).getTime();
        if (now > rowResetAt) {
          // window expired -> reset
          const resetAt = new Date(now + RATE_LIMIT_WINDOW).toISOString();
          await supabase.from('ai_rate_limits').update({ count: 1, reset_at: resetAt }).eq('user_id', userId);
          rateLimitInfo = { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW, count: 1 };
        } else if (row.count >= RATE_LIMIT_REQUESTS) {
          rateLimitInfo = { allowed: false, remaining: 0, resetAt: rowResetAt, count: row.count };
        } else {
          // increment
          const { error: incErr } = await supabase
            .from('ai_rate_limits')
            .update({ count: row.count + 1 })
            .eq('user_id', userId)
            .eq('reset_at', row.reset_at);
          if (incErr) throw incErr;
          rateLimitInfo = { allowed: true, remaining: RATE_LIMIT_REQUESTS - (row.count + 1), resetAt: rowResetAt, count: row.count + 1 };
        }
      }
    } else {
      throw new Error('Supabase unavailable for rate-limit');
    }
  } catch (rlFallbackErr) {
    // Fallback to in-memory rate limiter (best-effort)
    const rateLimit = checkRateLimit(`ai-assistant-${userId}`, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW);
    rateLimitInfo = rateLimit;
  }

  if (!rateLimitInfo.allowed) {
    console.warn('[aiAssistant] Rate limit exceeded:', { userId, count: rateLimitInfo.count });
    return {
      statusCode: 429,
      headers: {
        ...HEADERS,
        'Retry-After': Math.ceil((rateLimitInfo.resetAt - Date.now()) / 1000),
      },
      body: JSON.stringify({
        error: "Too many requests",
        message: "Zu viele Anfragen. Bitte warte einen Moment.",
        retryAfter: Math.ceil((rateLimitInfo.resetAt - Date.now()) / 1000),
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

  const { question, topic, existingMessages = [], isFirstTip = false, persona = 'default' } = body || {};

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Missing or invalid question" }),
    };
  }

  if (question.length > 400) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Question too long (max 400 characters)" }),
    };
  }

  // First tip is free, no coin check needed
  if (!isFirstTip) {
    // Check if user is registered
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

      // Check and deduct coins
      const { data: userRows, error: fetchErr } = await supabase
        .from('users')
        .select('coins')
        .eq('id', userId)
        .limit(1);

      if (fetchErr) {
        console.error('[aiAssistant] User fetch error:', fetchErr);
        return {
          statusCode: 500,
          headers: HEADERS,
          body: JSON.stringify({ error: "USER_FETCH_FAILED", message: fetchErr.message }),
        };
      }

      if (!userRows || userRows.length === 0) {
        return {
          statusCode: 404,
          headers: HEADERS,
          body: JSON.stringify({ error: "USER_NOT_FOUND" }),
        };
      }

      const userCoins = typeof userRows[0].coins === 'number' ? userRows[0].coins : 0;
      if (userCoins < COINS_PER_MESSAGE) {
        return {
          statusCode: 400,
          headers: HEADERS,
          body: JSON.stringify({
            error: "INSUFFICIENT_COINS",
            message: `Nicht genug Coins. Du hast ${userCoins}, benötigt werden ${COINS_PER_MESSAGE}.`,
            required: COINS_PER_MESSAGE,
            current: userCoins,
          }),
        };
      }

      // NOTE: Do not deduct here. Deduction occurs AFTER successful AI response to avoid charging on API failures.
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
    const prompt = buildContextPrompt(question.trim(), topic, existingMessages, persona);

    const modelCandidates = (process.env.GEMINI_MODELS || 'gemini-1.5-flash')
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

    // Post-processing: detect if AI returned direct solutions or full step-by-step.
    // If so, reject that response and return a didactic fallback without charging.
    const containsSolution = (text) => {
      if (!text || typeof text !== 'string') return false;
      const t = text.toLowerCase();
      // Patterns indicating direct numeric answers or final results
      const numericAnswerPattern = /(?:\b(?:ergebnis|lösung|resultat|antwort)\b[:\s]*|(?:^|\s)(?:x|y|z)\s*=|=>|=>\s*|=\s*)([-+]?\\d+(?:[\\.,]\\d+)?|±\\s*[-+]?\\d+)/i;
      const equalsNumber = /(?:=|≈|==|⇒|=>)\s*[-+]?\d/;
      const stepPattern = /schritt\s*\d|step\s*\d|1\)|2\)|3\)|schritte/;
      const calcSequence = /\\b(?:divide|multipl|add|subtract|geteilt|mal|plus|minus)\\b/;
      const explicitSolve = /löse|berechne|calculate|solve|result/;

      if (numericAnswerPattern.test(t) || equalsNumber.test(t)) return true;
      if (stepPattern.test(t) && /\\d/.test(t)) return true;
      if (explicitSolve.test(t) && /\\d/.test(t)) return true;
      // If many equals signs or many numeric tokens, suspect a solution
      const eqCount = (t.match(/[=⇒=>]/g) || []).length;
      const numTokens = (t.match(/\\d+/g) || []).length;
      if (eqCount >= 2 || numTokens >= 6) return true;
      return false;
    };

    if (containsSolution(responseText)) {
      console.warn('[aiAssistant] Rejected response due to detected solution content');
      // Log rejection to supabase for monitoring (best-effort)
      if (supabase) {
        const rejectionPayload = {
          user_id: userId,
          prompt: question ? question.substring(0, 1000) : null,
          rejected_text: responseText.substring(0, 2000),
          reason: 'detected_solution',
          created_at: new Date().toISOString(),
        };
        supabase.from('ai_rejections').insert(rejectionPayload).catch((e) => {
          console.warn('[aiAssistant] ai_rejections insert failed (non-fatal):', e && e.message);
        });
      }

      const fallbackHint = "Ich kann dir keine fertige Lösung geben. Stattdessen ein paar Fragen und Hinweise, die dir weiterhelfen: (1) Was ist bekannt in der Aufgabe? (2) Welche Formel oder Strategie könnte passen? (3) Versuche zuerst, die Aufgabe in kleinere Schritte zu zerlegen. Wenn du möchtest, kannst du mir einen konkreten Zwischenschritt nennen, dann gebe ich dir Feedback dazu.";

      return {
        statusCode: 200,
        headers: {
          ...HEADERS,
          'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
          'X-RateLimit-Remaining': String(rateLimitInfo.remaining || 0),
          'X-RateLimit-Reset': new Date(rateLimitInfo.resetAt || Date.now()).toISOString(),
        },
        body: JSON.stringify({
          content: fallbackHint,
          coinsCharged: 0,
          model: selectedModel,
          rejected: true,
        }),
      };
    }

    // AFTER successful AI response: deduct coins (if this was a paid follow-up)
    if (!isFirstTip && supabase) {
      try {
        // Re-fetch current coins to ensure user still can pay
        const { data: freshRows, error: freshErr } = await supabase
          .from('users')
          .select('coins')
          .eq('id', userId)
          .limit(1);

        if (freshErr) {
          console.error('[aiAssistant] User fetch error before deduction:', freshErr);
          return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ error: "USER_FETCH_FAILED", message: freshErr.message }),
          };
        }

        if (!freshRows || freshRows.length === 0) {
          return {
            statusCode: 404,
            headers: HEADERS,
            body: JSON.stringify({ error: "USER_NOT_FOUND" }),
          };
        }

        const freshCoins = typeof freshRows[0].coins === 'number' ? freshRows[0].coins : 0;
        if (freshCoins < COINS_PER_MESSAGE) {
          // If user cannot pay anymore, do not deliver the paid response
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({
              error: "INSUFFICIENT_COINS_AT_CHARGE",
              message: `Nicht genug Coins zum Abschließen der Anfrage. Du hast ${freshCoins}, benötigt werden ${COINS_PER_MESSAGE}.`,
            }),
          };
        }

        const newCoins = Math.max(0, freshCoins - COINS_PER_MESSAGE);
        // Atomic update: only update if coins still equal freshCoins (prevents race)
        const { data: updData, error: updErr } = await supabase
          .from('users')
          .update({ coins: newCoins })
          .eq('id', userId)
          .eq('coins', freshCoins);

        if (updErr) {
          console.error('[aiAssistant] Coin update error after AI response:', updErr);
          return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ error: "COIN_UPDATE_FAILED", message: updErr.message }),
          };
        }

        if (!updData || updData.length === 0) {
          // Concurrent modification: user coins changed between check and update
          console.warn('[aiAssistant] Coin update conflict: concurrent modification', { userId });
          return {
            statusCode: 409,
            headers: HEADERS,
            body: JSON.stringify({
              error: "COIN_UPDATE_CONFLICT",
              message: "Kontoänderung erkannt. Bitte versuche es erneut.",
            }),
          };
        }

        // Insert ledger entry (best-effort)
        const ledgerPayload = {
          user_id: userId,
          delta: -COINS_PER_MESSAGE,
          reason: 'ai_assistant_message',
          ref_type: 'ai_chat',
          ref_id: `msg-${Date.now()}`,
        };
        await supabase.from('coin_ledger').insert(ledgerPayload).catch((err) => {
          console.warn('[aiAssistant] Ledger insert failed (non-fatal):', err.message);
        });
      } catch (err) {
        console.error('[aiAssistant] Deduction error:', err);
        return {
          statusCode: 500,
          headers: HEADERS,
          body: JSON.stringify({ error: "DEDUCTION_FAILED", message: "Fehler beim Abbuchen der Coins." }),
        };
      }
    }

    // Log usage event (best-effort)
    if (supabase) {
      try {
        await supabase.from('ai_usage').insert({
          user_id: userId,
          prompt: question ? question.substring(0, 1000) : null,
          model: selectedModel || null,
          coins_charged: isFirstTip ? 0 : COINS_PER_MESSAGE,
          rejected: false,
          fallback: false,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[aiAssistant] ai_usage insert failed (non-fatal):', e && e.message);
      }
    }

    return {
      statusCode: 200,
      headers: {
        ...HEADERS,
        'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining || 0),
        'X-RateLimit-Reset': new Date(rateLimitInfo.resetAt || Date.now()).toISOString(),
      },
      body: JSON.stringify({
        content: responseText.trim(),
        coinsCharged: isFirstTip ? 0 : COINS_PER_MESSAGE,
        model: selectedModel,
      }),
    };
  } catch (error) {
    console.error('[aiAssistant] Gemini Error:', error);
    // If the error indicates model not found or unsupported, provide a safe local fallback hint (no charge)
    const errMsg = (error && (error.message || JSON.stringify(error))) || '';
    if (errMsg.includes('NOT_FOUND') || errMsg.includes('is not found') || errMsg.includes('not found')) {
      const fallbackHint = "Der externe KI-Dienst ist momentan nicht verfügbar. Hier ein kurzer Hinweis: Lies die Aufgabe genau, identifiziere gegebene Größen und gesuchte Werte. Frage dich, welche Formel zum Thema passt und welche Zwischenschritte nötig sind. Nenne mir einen Zwischenschritt, dann gebe ich Feedback.";
      // Log fallback event
      if (supabase) {
        try {
          await supabase.from('ai_fallbacks').insert({
            user_id: userId,
            prompt: question ? question.substring(0, 1000) : null,
            reason: 'model_not_found',
            details: errMsg.substring(0, 2000),
            created_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('[aiAssistant] ai_fallbacks insert failed (non-fatal):', e && e.message);
        }
      }
      return {
        statusCode: 200,
        headers: {
          ...HEADERS,
          'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
          'X-RateLimit-Remaining': String(rateLimitInfo.remaining || 0),
          'X-RateLimit-Reset': new Date(rateLimitInfo.resetAt || Date.now()).toISOString(),
        },
        body: JSON.stringify({
          content: fallbackHint,
          coinsCharged: 0,
          model: null,
          fallback: true,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        error: "GEMINI_REQUEST_FAILED",
        message: "Der KI-Service ist momentan nicht verfügbar. Bitte versuche es später noch einmal.",
        details: errMsg || "Unknown error",
      }),
    };
  }
};

