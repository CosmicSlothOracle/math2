
// Hinweis: Lokale Hilfsfunktion ruft das Netlify-Backend auf, das wiederum Gemini anspricht
export async function getMatheHint(topic: string, question: string): Promise<string> {
  try {
    const res = await fetch("/.netlify/functions/hint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, question }),
    });

    const data = await res.json();

    // Backend returns 200 with error field when API key is missing (graceful error)
    if (data.error) {
      console.warn("Hint API error:", data.error, data.details || '');
      // Return the hint message if provided, otherwise use fallback
      return data.hint || "Der Tipp-Service ist momentan nicht verfügbar. Bitte versuche es später noch einmal oder frage deinen Lehrer um Hilfe.";
    }

    if (!res.ok) {
      const errorData = data || { error: `HTTP ${res.status}` };
      console.error("Hint fetch failed:", res.status, errorData);
      return `Der Tipp-Service ist momentan nicht verfügbar. Bitte versuche es später noch einmal.`;
    }

    return data.hint || "Kein Tipp verfügbar.";
  } catch (error) {
    console.error("Hint fetch failed:", error);
    return `Ups, der Tipp-Service ist gerade nicht verfügbar. ${error instanceof Error ? error.message : 'Versuch es nochmal!'}`;
  }
}

export async function getTopicExplanation(topic: string) {
  // Use recommended initialization with process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
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
