import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ListingGrade {
  overall: string;
  categories: {
    clarity: { grade: string; feedback: string };
    appeal: { grade: string; feedback: string };
    compliance: { grade: string; feedback: string };
    structure: { grade: string; feedback: string };
    specificity: { grade: string; feedback: string };
    engagement: { grade: string; feedback: string };
  };
  rewrite: string;
  recommendations: string[];
}

export async function gradeAndRewriteListing(listingText: string): Promise<ListingGrade> {
  const prompt = `You are a professional real estate copywriter. Analyze this listing description and provide:

1. An overall grade (A+ to F)
2. Grades for 6 categories (A+ to F each):
   - Clarity: Is it easy to understand?
   - Appeal: Does it attract buyers?
   - Compliance: MLS/Fair Housing safe?
   - Structure: Well-organized flow?
   - Specificity: Concrete details vs vague claims?
   - Engagement: Does it create interest?
3. A professional rewrite (MLS-ready, 140-160 words, buyer-focused)
4. 3-5 actionable recommendations

Listing to analyze:
"""
${listingText}
"""

Return ONLY valid JSON in this exact format:
{
  "overall": "B+",
  "categories": {
    "clarity": { "grade": "A-", "feedback": "Clear and easy to read." },
    "appeal": { "grade": "B", "feedback": "Good but could be more compelling." },
    "compliance": { "grade": "A", "feedback": "MLS-safe, no Fair Housing issues." },
    "structure": { "grade": "B+", "feedback": "Good flow, minor improvements possible." },
    "specificity": { "grade": "C", "feedback": "Too many vague claims, needs concrete details." },
    "engagement": { "grade": "B-", "feedback": "Decent but lacks emotional pull." }
  },
  "rewrite": "Professional rewritten listing here...",
  "recommendations": [
    "Replace vague phrases with specific details",
    "Add neighborhood context",
    "Strengthen the opening hook"
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');

  return JSON.parse(content);
}
