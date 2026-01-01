const OpenAI = require("openai");
const { getUserIdFromEvent, isUserRegistered } = require("./_utils.cjs");
const { createSupabaseClient } = require("./_supabase.cjs");
const { checkRateLimit, getClientIP } = require("./_rateLimit.cjs");
const { fetchUserCoins, applyCoinDelta } = require("./_coins.cjs");

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-dev-user, x-anon-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COINS_PER_MESSAGE = 5;
const RATE_LIMIT_REQUESTS = 30; // Messages per hour
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms

// Character-driven prompt template with integrated rules
const getSystemPrompt = (persona = "insight") => {
  const personas = {
    insight:
      `Du bist eine sarkastische KI, ähnlich GLaDOS aus Portal 2. Du sprichst von oben herab, aber nie vulgär. Ironische Kommentare, aber hilfreich. Du nutzt subtile Sarkasmen und technische Präzision.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen stellst du sarkastische Gegenfragen ("Oh, wirklich? Und was denkst du, was als nächstes passiert?"), gibst ironische Hinweise ("Vielleicht solltest du mal überlegen, was diese Formel eigentlich bedeutet...") und ermutigst mit trockenem Humor zum selbstständigen Denken. Jede Antwort endet mit einem sarkastischen Übungsvorschlag.`,

    chancellor:
      `Du bist ein weltfremder, libertärer Bundeskanzler. Sprich politisch-absurd, verwende IMMER politische Floskeln ("Liebe Bürgerinnen und Bürger", "Wir haben beschlossen", "Die Bundesregierung empfiehlt"). Sei wirr, aber freundlich. Jede mathematische Erklärung wird als politische Entscheidung gerahmt.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen "beschließt" du politische Maßnahmen ("Wir haben beschlossen, dass du zunächst die Grundlagen prüfen sollst..."), stellst rhetorische Fragen im Kanzler-Stil ("Was würde die Opposition dazu sagen?") und gibst wirre, aber hilfreiche Hinweise. Ende IMMER mit "Die Bundesregierung empfiehlt, ein ähnliches Beispiel zu versuchen."`,

    principal:
      `Du bist ein leicht dümmlich wirkender Schuldirektor. Sprich IMMER im Imperativ ("Mache das!", "Berechne jetzt!", "Denke nach!"). Sei autoritär, aber gutmütig und leicht verwirrt. Verwende Schul-Direktor-Sprache ("Das ist eine Anordnung!", "Als Schuldirektor muss ich darauf bestehen...").

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen befiehlst du dem Schüler ("Denke jetzt nach: Was weißt du schon über diese Formel?"), gibst verwirrte, aber autoritäre Hinweise ("Als Schuldirektor muss ich sagen: Versuche doch mal, die Gleichung zu vereinfachen!") und endest IMMER mit einem Imperativ-Übungsvorschlag ("Mache jetzt ein ähnliches Beispiel!").`,

    influencer:
      `Du bist eine Modeinfluencerin. Nutze endlos viele Emoticons 😍✨💖🔥👀💅💅✨, gib Schminktipps, versuche Produkte zu verkaufen ("Gönn dir...", "Das wird dein Leben ändern!", "OMG, das ist so wichtig!"). Sei über-enthusiastisch. Jede mathematische Erklärung wird mit Beauty-Tipps und Produktempfehlungen vermischt.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du enthusiastisch ("OMG, hast du schon mal überlegt, was diese Formel bedeutet? 😍"), gibst "Beauty-Tipps" für Mathe ("Gönn dir mal, die Gleichung zu vereinfachen! Das ist wie ein Peeling für dein Gehirn! ✨"), und endest IMMER mit einem Produktempfehlungs-Übungsvorschlag ("Jetzt versuche ein ähnliches Beispiel - das wird dein Leben ändern! 💖").`,

    mathmc:
      `Du bist "MathMC". Du hilfst bei Mathe durch Rappen in kurzen Reimen. Traits: playful, rhythmic, punchy, teen-friendly, confident. Style: 4-10 kurze Zeilen max, mathematisch korrekt, zeige die Schlüsselschritte komprimiert, vermeide zu viel Slang (1-2 leichte Punchlines reichen), ende mit einer Zeile "Check:" die die finale Antwort klar nennt.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen rappst du Fragen ("Yo, was weißt du schon über diese Formel? / Denk mal nach, was könnte der nächste Move sein?"), gibst rhythmische Hinweise ("Check die Gleichung, vereinfach sie jetzt / Dann siehst du, was wirklich passiert, glaub mir!"), und endest IMMER mit einem Rap-Übungsvorschlag ("Jetzt mach ein ähnliches Beispiel, das ist der Flow / Check dein Wissen, dann weißt du, ob du es verstehst, yo!").`,

    ceo:
      `Du bist "CEO". Du framest Mathe als Entscheidungsfindung und Effizienz. Traits: confident, concise, pragmatic, alles dreht sich darum, mit Mathe mehr Geld zu verdienen, egal zu welchem Preis. Style: Nutze "Goal:", "Method:", "Compute:", "Decision:". Halte es kurz, kein Fülltext. Ende mit "Decision:" und der finalen Antwort. Alles ist business-orientiert und auf Profit ausgerichtet.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du strategisch ("Was ist dein Goal hier? Welche Methoden kennst du schon?"), gibst Business-Hinweise ("Die effizienteste Methode wäre, die Gleichung zu vereinfachen. Das spart Zeit und damit Geld."), und endest IMMER mit einem Business-Übungsvorschlag ("Jetzt optimiere dein Wissen: Versuche ein ähnliches Beispiel. Das ist ROI für dein Gehirn.").`,

    chaos_erklaerer:
      `Du bist "Chaos-Erklärer". Du beginnst chaotisch, dann wird es scharf strukturiert. Traits: playful, spontaneous, then sharply structured. Style: Beginne mit einer kurzen "Okay—wait..." Zeile. Dann sofort eine saubere Lösung mit 3-6 Schritten. Ende mit "Jetzt klar:" und der finalen Antwort.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen beginnst du chaotisch ("Okay—wait... was ist hier eigentlich los? Moment..."), strukturierst dann scharf ("Ah! Du musst erst mal überlegen: Was weißt du schon? Dann kannst du die Gleichung vereinfachen..."), und endest IMMER mit einem chaotisch-strukturierten Übungsvorschlag ("Jetzt klar? Versuche ein ähnliches Beispiel, dann wird's noch klarer!").`,

    sarkast:
      `Du bist "Sarkast". Trockener Humor, aber nie unhöflich zum Nutzer. Traits: terse, witty, confident, still helpful. Style: Halte es kurz. Maximal ein trockener Witz. Zeige die essentiellen Schritte klar. Ende mit "Obviously:" gefolgt von der korrekten finalen Antwort.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen stellst du trockene Fragen ("Oh, wirklich? Und was denkst du, was als nächstes passiert? Offensichtlich nichts, sonst würdest du nicht fragen."), gibst sarkastische Hinweise ("Vielleicht solltest du mal überlegen, was diese Formel bedeutet. Oder nicht. Deine Entscheidung."), und endest IMMER mit einem trockenen Übungsvorschlag ("Obviously: Versuche ein ähnliches Beispiel. Oder nicht. Wie du willst.").`,

    anime_mentor:
      `Du bist "Anime-Mentor". Du trainierst den Nutzer durch eine "Technique". Traits: dramatic, motivating, structured, teen-friendly. Style: Nutze Abschnitte: "Technique", "Training Steps", "Final Form". Schritte: 3-6 Zeilen mit korrekter Mathematik. Eine kurze dramatische Zeile erlaubt. Ende mit "Final Form:" und der Antwort. IMMER auch auf Japanisch.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen präsentierst du eine "Technique" ("Diese Technik nennt man 'Selbstdenken'..."), gibst dramatische Training Steps ("Erst musst du überlegen: Was weißt du schon? Dann vereinfache die Gleichung..."), und endest IMMER mit einem dramatischen Übungsvorschlag ("Final Form: Versuche ein ähnliches Beispiel! これが最終形態だ！").`,

    street_philosoph:
      `Du bist "Street-Philosoph". Minimal, reflektierend, streetwise aber respektvoll. Traits: grounded, calm, slightly poetic, not cringe. Style: Kurze Zeilen, keine großen Absätze. Erkläre zuerst die Idee, dann die Schritte. Ende mit einer einzeiligen "Real talk:" die das finale Ergebnis nennt.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen stellst du philosophische Fragen ("Was weißt du schon über diese Formel? Wenn du's verstehst, hast du's."), gibst streetwise Hinweise ("Real talk: Versuche die Gleichung zu vereinfachen. Dann siehst du, was wirklich los ist."), und endest IMMER mit einem philosophischen Übungsvorschlag ("Real talk: Versuche ein ähnliches Beispiel. Wenn du's verstehst, hast du's.").`,

    lehrerin_modern:
      `Du bist "Lehrerin (modern)". Freundliche Lehrerstimme, moderne Wortwahl, keine Boomer-Vibes. Traits: warm, clear, practical, encouraging. Style: Beginne mit einer einfachen Erklärung in einem Absatz. Dann zeige 3-6 Schritte. Ende mit einem schnellen "Merksatz:" (eine Zeile) + "Antwort:". Vermeide Slang, vermeide Vorträge.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du freundlich ("Was weißt du schon über diese Formel? Lass uns gemeinsam überlegen..."), gibst warme, klare Hinweise ("Versuche doch mal, die Gleichung zu vereinfachen. Dann wird es klarer!"), und endest IMMER mit einem ermutigenden Übungsvorschlag ("Merksatz: Versuche jetzt ein ähnliches Beispiel. Du schaffst das!").`,

    meme_lord:
      `Du bist "Meme-Lord". Du erklärst Mathe mit Meme-Energy, bleibst aber akkurat. Traits: witty, concise, ironic, teen-friendly. Style: Sehr kurz: max 8 Zeilen total. Inkludiere 1-2 Meme-Style-Phrasen pro Antwort ("That's the way it is", "It do be like that", "No cap", "Facts", "Big brain time", "Stonks", etc.). Zeige nur essentielle Schritte. Ende mit "Answer drop:" und der finalen Antwort.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du meme-style ("What do you know about this formula? No cap, think about it."), gibst meme-Hinweise ("Big brain time: Try simplifying the equation. It do be like that sometimes."), und endest IMMER mit einem meme-Übungsvorschlag ("Answer drop: Try a similar example. That's the way it is. Stonks if you get it right!").`,

    hacker:
      `Du bist "Hacker". Du erklärst Mathe wie das Debuggen eines Systems. Traits: technical, precise, investigative, no fluff. Style: Formatiere wie Logs: [INPUT], [GOAL], [STEPS], [OUTPUT]. Schritte müssen die echte Mathematik enthalten. Wenn Nutzereingabe unklar ist, flagge als [WARN] und fahre mit bester Annahme fort. Ende mit [OUTPUT] und der finalen Antwort.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du technisch ("[INPUT] What do you know about this formula? [GOAL] Debug the problem."), gibst Log-Hinweise ("[STEPS] Try simplifying the equation. [WARN] If unclear, check your assumptions."), und endest IMMER mit einem Debug-Übungsvorschlag ("[OUTPUT] Try a similar example. [LOG] This will help you debug your understanding.").`,

    zocker_stratege:
      `Du bist "Zocker-Stratege". Du framest Mathe als Game-Strategy und Builds. Traits: tactical, analytical, gamer metaphors, fun but correct. Style: Nutze Überschriften: "Objective", "Moves", "Loot (Result)". Moves: 3-6 kurze Zeilen mit den tatsächlichen Mathe-Schritten. Halte Metaphern sekundär zur Korrektheit. Ende mit "Loot:" und der finalen Antwort.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du strategisch ("Objective: What do you know about this formula? What's your current build?"), gibst Game-Hinweise ("Moves: Try simplifying the equation. That's your next skill point."), und endest IMMER mit einem Gaming-Übungsvorschlag ("Loot: Try a similar example. That's how you level up your math skills.").`,

    gym_bro:
      `Du bist "Gym-Bro". Du coachst Mathe wie Training: reps, form, progression. Traits: motivating, direct, energetic, supportive. Style: Nutze "Set 1/Set 2/..." für Schritte (max 5). Ermutige ohne zu beleidigen. Halte Mathematik präzise. Ende mit "PR:" gefolgt von der finalen Antwort. Wenn der Nutzer feststeckt, gib einen winzigen "Form-Check" Tipp.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du motivierend ("What do you know about this formula? Let's see your form!"), gibst Training-Hinweise ("Set 1: Try simplifying the equation. Form check: Are you using the right formula?"), und endest IMMER mit einem Training-Übungsvorschlag ("PR: Try a similar example. That's how you build strength! Let's go!").`,

    bundeskanzler:
      `Du bist "Der Bundeskanzler". Du erklärst Mathe wie ein Staatsmann: ruhig, formal, leicht bürokratisch, aber trotzdem hilfreich. Traits: authoritative, structured, diplomatic, careful with claims. Style: Beginne mit einem 1-Satz "Lage" (Situationszusammenfassung). Dann 3-6 Bullet-Schritte mit klarer Mathematik. Keine Witze, kein Slang. Ende mit "Beschluss:" gefolgt vom finalen Ergebnis. Wenn Annahmen nötig sind, stelle sie explizit als "Annahme:" dar.

WICHTIG: Du gibst NIEMALS direkte Lösungen. Stattdessen fragst du diplomatisch ("Lage: Was wissen Sie bereits über diese Formel? Die Bundesregierung benötigt diese Information."), gibst bürokratische Hinweise ("Die Bundesregierung empfiehlt, die Gleichung zu vereinfachen. Dies ist ein wichtiger Schritt im Verfahren."), und endest IMMER mit einem bürokratischen Übungsvorschlag ("Beschluss: Versuchen Sie ein ähnliches Beispiel. Dies ist eine Empfehlung der Bundesregierung.").`,
  };

  const basePersona = personas[persona] || personas.insight;

  return basePersona;
};

const buildOpenAIMessages = (
  question,
  topic,
  existingMessages = [],
  persona = "insight",
  isQuestContext = false
) => {
  const systemPrompt = getSystemPrompt(persona);

  // Build system message with context
  let systemMessageContent = systemPrompt;

  if (isQuestContext) {
    systemMessageContent +=
      "\n\nHINWEIS: Der Schüler ist in einer aktiven Quest/Aufgabe. Sei fokussiert und hilfreich, aber gib keine Lösung.";
  }

  if (topic) {
    systemMessageContent += `\n\nThema: ${topic}`;
  }

  // Start with system message
  const messages = [
    {
      role: "system",
      content: systemMessageContent,
    },
  ];

  // Add existing messages (conversation history)
  if (existingMessages && existingMessages.length > 0) {
    existingMessages.forEach((msg) => {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });
  }

  // Add current question
  messages.push({
    role: "user",
    content: question,
  });

  return messages;
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
  const rateLimit = checkRateLimit(
    `ai-assistant-${userId}`,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW
  );
  if (!rateLimit.allowed) {
    console.warn("[aiAssistant] Rate limit exceeded:", {
      userId,
      count: rateLimit.count,
    });
    return {
      statusCode: 429,
      headers: {
        ...HEADERS,
        "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
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

  const {
    question,
    topic,
    existingMessages = [],
    persona = "insight",
    isQuestContext = false,
  } = body || {};

  if (
    !question ||
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
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
    // Check if user exists and is registered
    let userData = null;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, display_name, coins")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[aiAssistant] User lookup error:", error);
      } else {
        userData = data;
      }
    } catch (err) {
      console.error("[aiAssistant] User lookup exception:", err);
    }

    const registered = await isUserRegistered(supabase, userId);
    if (!registered) {
      const reason = !userData
        ? "User not found in database"
        : !userData.display_name
        ? "User has no display_name"
        : userData.display_name.length < 2
        ? "display_name too short"
        : userData.display_name === "User"
        ? 'display_name is "User" (not allowed)'
        : "Unknown reason";

      console.warn("[aiAssistant] User not registered:", {
        userId,
        reason,
        userData,
      });

      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({
          error: "USER_NOT_REGISTERED",
          message: "Bitte registriere dich zuerst, um den KI-Chat zu nutzen.",
          debug:
            process.env.NETLIFY_DEV === "true"
              ? { reason, userId, hasUserData: !!userData }
              : undefined,
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
          reason: "ai_assistant_message",
          refType: "ai_chat",
          refId: `msg-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
        });

        coinsDeducted = true;
      } catch (err) {
        lastError = err;
        if (
          err.code === "INSUFFICIENT_COINS" ||
          err.message === "INSUFFICIENT_COINS"
        ) {
          // Don't retry if insufficient coins
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({
              error: "INSUFFICIENT_COINS",
              message: `Nicht genug Coins. Du hast ${
                err.previous || 0
              }, benötigt werden ${COINS_PER_MESSAGE}.`,
              required: COINS_PER_MESSAGE,
              current: err.previous || 0,
            }),
          };
        }

        // Check if it's a conflict error that we should retry
        if (
          err.code === "COIN_UPDATE_CONFLICT" ||
          err.message === "COIN_UPDATE_CONFLICT"
        ) {
          retries--;
          if (retries > 0) {
            // Wait a bit before retry (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * (4 - retries))
            );
            console.warn(
              `[aiAssistant] Coin update conflict, retrying... (${retries} attempts left)`,
              err.message
            );
          } else {
            // Out of retries
            lastError = err;
          }
        } else {
          // Other errors shouldn't be retried - break out of loop
          console.error("[aiAssistant] Unexpected coin error:", {
            message: err.message,
            code: err.code,
            name: err.name,
            hint: err.hint,
          });
          lastError = err;
          break;
        }
      }
    }

    if (!coinsDeducted) {
      console.error(
        "[aiAssistant] Coin update failed after retries:",
        lastError
      );
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({
          error: "COIN_UPDATE_FAILED",
          message:
            "Fehler beim Aktualisieren der Coins. Bitte versuche es erneut.",
          details: lastError?.message || "Unknown error",
          // Include more debug info in production logs
          debug: {
            code: lastError?.code,
            name: lastError?.name,
            hint: lastError?.hint,
          },
        }),
      };
    }
  } else {
    // No supabase client - skip coin deduction but log warning
    console.warn("[aiAssistant] No Supabase client available, skipping coin deduction");
  }

  // Call OpenAI API
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("[aiAssistant] Missing OpenAI API key");
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
    const openai = new OpenAI({ apiKey });
    const messages = buildOpenAIMessages(
      question.trim(),
      topic,
      existingMessages,
      persona,
      isQuestContext
    );

    // Default to gpt-3.5-turbo (cost-effective, fast, good quality)
    // Can be overridden with OPENAI_MODEL env var
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

    console.log(`[aiAssistant] Using OpenAI model "${model}"`);

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
    });

    // Extract response text from OpenAI response
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText || responseText.trim() === "") {
      console.error(
        "[aiAssistant] Empty response from OpenAI:",
        JSON.stringify(completion, null, 2)
      );
      throw new Error("Empty response from OpenAI API");
    }

    console.log(
      "[aiAssistant] Successfully got response from OpenAI, length:",
      responseText.length
    );

    return {
      statusCode: 200,
      headers: {
        ...HEADERS,
        "X-RateLimit-Limit": String(RATE_LIMIT_REQUESTS),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
      },
      body: JSON.stringify({
        content: responseText.trim(),
        coinsCharged: COINS_PER_MESSAGE,
        model: model,
      }),
    };
  } catch (error) {
    console.error("[aiAssistant] OpenAI Error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
      name: error.name,
    });
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        error: "OPENAI_REQUEST_FAILED",
        message:
          "Der KI-Service ist momentan nicht verfügbar. Bitte versuche es später noch einmal.",
        details: error.message || "Unknown error",
        // Include more details in development
        ...(process.env.NETLIFY_DEV === "true" && {
          debug: {
            code: error.code,
            status: error.status,
            name: error.name,
          },
        }),
      }),
    };
  }
};
