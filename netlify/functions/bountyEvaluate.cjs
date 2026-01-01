const OpenAI = require("openai");
const { getUserIdFromEvent } = require("./_utils.cjs");
const { checkRateLimit } = require("./_rateLimit.cjs");

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-dev-user, x-anon-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RATE_LIMIT_REQUESTS = 50; // Evaluations per hour
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms

/**
 * Builds the evaluation prompt for OpenAI
 */
const buildEvaluationPrompt = (question, userAnswer, correctAnswer, explanation, multiInputFields) => {
  let prompt = `Du bist ein Mathematiklehrer, der Schülerantworten bewertet.

AUFGABE:
${question}

RICHTIGE ANTWORT (Referenz):
${correctAnswer}

ERKLÄRUNG (Referenz):
${explanation}`;

  if (multiInputFields && multiInputFields.length > 0) {
    prompt += `\n\nTEILAUFGABEN:\n`;
    multiInputFields.forEach((field, idx) => {
      prompt += `${idx + 1}. ${field.label}\n`;
    });
  }

  prompt += `\n\nSCHÜLERANTWORT ZU BEWERTEN:
${userAnswer}

BEWERTE die Schülerantwort nach folgenden Kriterien:
1. Ist die Antwort vollständig korrekt? (Ja/Nein)
2. Wenn es Teilaufgaben gibt: Welche Teilaufgaben sind korrekt gelöst? (Nummern auflisten)
3. Welche Teilaufgaben sind falsch? (Nummern auflisten)
4. Für jede falsche Teilaufgabe: Warum ist sie falsch und was wäre richtig?

ANTWORTE IM FOLGENDEN JSON-FORMAT (kein zusätzlicher Text, nur JSON):
{
  "isFullyCorrect": true/false,
  "correctSubTasks": [Array von Teilaufgaben-Nummern, z.B. [1, 2] oder [] wenn keine],
  "incorrectSubTasks": [
    {
      "subTaskNumber": 1,
      "reason": "Kurze Erklärung warum falsch",
      "correctAnswer": "Was wäre richtig gewesen"
    }
  ],
  "overallFeedback": "Kurze Gesamtbewertung der Antwort"
}

WICHTIG:
- Sei fair und konstruktiv
- Erkenne auch teilweise richtige Antworten
- Wenn die Antwort vollständig korrekt ist, setze isFullyCorrect auf true und lasse incorrectSubTasks leer
- Wenn es keine Teilaufgaben gibt, verwende correctSubTasks und incorrectSubTasks als leere Arrays
- Die Antwort muss valides JSON sein, kein zusätzlicher Text, keine Markdown-Formatierung, kein Code-Block
- Beginne direkt mit { und ende mit }`;

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

  // Rate limiting
  const rateLimit = checkRateLimit(
    `bounty-evaluate-${userId}`,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW
  );
  if (!rateLimit.allowed) {
    console.warn("[bountyEvaluate] Rate limit exceeded:", {
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
        message: "Zu viele Evaluierungen. Bitte warte einen Moment.",
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
    userAnswer,
    correctAnswer,
    explanation,
    multiInputFields,
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

  if (
    !userAnswer ||
    typeof userAnswer !== "string" ||
    userAnswer.trim().length === 0
  ) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Missing or invalid userAnswer" }),
    };
  }

  if (!correctAnswer || typeof correctAnswer !== "string") {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: "Missing or invalid correctAnswer" }),
    };
  }

  // Check OpenAI API key
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("[bountyEvaluate] Missing OpenAI API key");
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        error: "API_KEY_MISSING",
        message: "Der Evaluierungs-Service ist momentan nicht verfügbar.",
      }),
    };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const prompt = buildEvaluationPrompt(
      question,
      userAnswer,
      correctAnswer,
      explanation || "",
      multiInputFields || []
    );

    // Use gpt-3.5-turbo as default (cost-effective and fast)
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

    console.log(`[bountyEvaluate] Using OpenAI model "${model}"`);

    // Build request - note: response_format might not be supported in older gpt-3.5-turbo versions
    const requestOptions = {
      model: model,
      messages: [
        {
          role: "system",
          content:
            "Du bist ein präziser Mathematiklehrer. Antworte IMMER nur mit valides JSON, kein zusätzlicher Text. Die Antwort muss ein gültiges JSON-Objekt sein.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent evaluation
    };

    // Only add response_format if model supports it (gpt-3.5-turbo-1106+ or gpt-4+)
    if (model.includes("gpt-4") || model.includes("gpt-3.5-turbo-1106") || model.includes("gpt-3.5-turbo-0125")) {
      requestOptions.response_format = { type: "json_object" };
    }

    const completion = await openai.chat.completions.create(requestOptions);

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText || responseText.trim() === "") {
      console.error(
        "[bountyEvaluate] Empty response from OpenAI:",
        JSON.stringify(completion, null, 2)
      );
      throw new Error("Empty response from OpenAI API");
    }

    // Parse JSON response
    let evaluationResult;
    try {
      evaluationResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[bountyEvaluate] Failed to parse JSON response:", {
        responseText,
        error: parseError.message,
      });
      // Try to extract JSON from response if it's wrapped in markdown
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                        responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          evaluationResult = JSON.parse(jsonMatch[1]);
        } catch (e) {
          throw new Error("Failed to parse JSON response");
        }
      } else {
        throw new Error("Failed to parse JSON response");
      }
    }

    // Validate structure
    if (
      typeof evaluationResult.isFullyCorrect !== "boolean" ||
      !Array.isArray(evaluationResult.correctSubTasks) ||
      !Array.isArray(evaluationResult.incorrectSubTasks)
    ) {
      console.error("[bountyEvaluate] Invalid evaluation structure:", evaluationResult);
      throw new Error("Invalid evaluation structure");
    }

    console.log(
      "[bountyEvaluate] Successfully evaluated answer:",
      evaluationResult.isFullyCorrect
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
        ...evaluationResult,
        model: model,
      }),
    };
  } catch (error) {
    console.error("[bountyEvaluate] OpenAI Error:", {
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
        error: "EVALUATION_FAILED",
        message:
          "Die Evaluierung ist fehlgeschlagen. Bitte versuche es später noch einmal.",
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

