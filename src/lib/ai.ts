// Constants for the "Hard Free Tier" policy
const DAILY_POST_LIMIT = 1;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function generateWithGemini(prompt: string, apiKey: string) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  });

  if (response.status === 429) {
    console.error("Gemini Rate Limit Hit (Free Tier)");
    return null;
  }

  const data = await response.json() as any;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export async function gatherResources(topic: string, serperKey: string) {
  if (!serperKey) return { facts: [], imageUrl: "" };

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: topic, num: 5 })
    });
    
    const data = await response.json() as any;
    const facts = data.organic?.map((res: any) => res.snippet) || [];
    
    // Using LoremFlickr for stable, free, keyword-based images
    const imageUrl = `https://loremflickr.com/1200/675/${encodeURIComponent(topic.split(' ')[0])}`;

    return { facts, imageUrl };
  } catch (e) {
    console.error("Resource gathering failed, falling back to AI only.");
    return { facts: [], imageUrl: "" };
  }
}

export async function generateFullArticle(topic: string, geminiKey: string, serperKey: string) {
  const resources = await gatherResources(topic, serperKey);
  
  const prompt = `
    You are a professional SEO content writer. 
    Write a detailed, engaging blog article about "${topic}".
    
    Context/Facts: ${resources.facts.join(" ")}
    
    Requirements:
    1. Tone: Authoritative yet accessible.
    2. Format: Use <h2> for subheadings, <p> for paragraphs, and <ul> for lists.
    3. Length: At least 600 words.
    
    IMPORTANT: Respond ONLY with a JSON object.
    {
      "title": "...",
      "content": "...",
      "summary": "...",
      "slug": "..."
    }
  `;

  const aiResponse = await generateWithGemini(prompt, geminiKey);
  if (!aiResponse) return null;

  try {
    const cleanJson = aiResponse.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanJson);
    return {
      ...result,
      imageUrl: resources.imageUrl
    };
  } catch (e) {
    console.error("Failed to parse AI JSON response");
    return null;
  }
}
