import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function gradeAndRewriteListing(listingText: string) {
  const prompt = `You are a real estate listing expert. Analyze this MLS listing and provide:

1. An overall grade (A, B, C, or D)
2. Grades for 6 categories (headline, length, emotion, keywords, cta, professionalism) - each A, B, C, or D
3. Feedback for each category (one sentence)
4. A professional MLS-ready rewrite (140-160 words, engaging, specific, compliant)
5. Three actionable recommendations

Listing to analyze:
"${listingText}"

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "overall": "B",
  "categories": {
    "headline": {"grade": "B", "feedback": "Good but could be more specific"},
    "length": {"grade": "C", "feedback": "Too short, needs more detail"},
    "emotion": {"grade": "B", "feedback": "Some emotional appeal present"},
    "keywords": {"grade": "C", "feedback": "Missing key search terms"},
    "cta": {"grade": "D", "feedback": "No clear call to action"},
    "professionalism": {"grade": "B", "feedback": "Generally professional tone"}
  },
  "rewrite": "Your rewritten listing here...",
  "recommendations": [
    "Add specific room dimensions",
    "Include neighborhood highlights",
    "Add a strong call to action"
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a real estate copywriting expert. Always return valid JSON without markdown formatting.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });

  const responseText = completion.choices[0].message.content || '{}';
  
  // Strip markdown code blocks if present
  const cleanedText = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleanedText);
}
