import OpenAI from 'openai';

export async function gradeAndRewriteListing(listingText: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `You are an elite real estate copywriter specializing in MLS listings that convert browsers into buyers. You've written thousands of top-performing listings and understand exactly what drives showings and offers.

ANALYZE THIS LISTING:
"${listingText}"

GRADING RUBRIC (be strict and honest):

Headline Quality (A-D):
- A: Specific, benefit-driven, includes key feature (e.g., "Lakefront 4BR with Dock & Sunset Views")
- B: Descriptive but generic (e.g., "Beautiful Home in Great Location")
- C: Vague or boring (e.g., "Nice House for Sale")
- D: Missing or terrible

Description Length (A-D):
- A: 140-160 words (proven conversion sweet spot)
- B: 100-139 or 161-200 words
- C: 50-99 or 201-250 words
- D: Under 50 or over 250 words

Emotional Appeal (A-D):
- A: Vivid sensory details, lifestyle benefits, paints a picture of living there
- B: Some emotional language but mostly factual
- C: Purely factual, no emotion
- D: Boring or negative tone

Keywords & SEO (A-D):
- A: Includes neighborhood, schools, lifestyle keywords buyers search for
- B: Basic location info, missing key search terms
- C: Generic descriptions, no local context
- D: No searchable keywords

Call to Action (A-D):
- A: Strong, urgent CTA (e.g., "Schedule your private showing before it's gone")
- B: Weak CTA (e.g., "Contact for more info")
- C: Passive language, no urgency
- D: No CTA at all

Professionalism (A-D):
- A: Perfect grammar, Fair Housing compliant, MLS-ready
- B: Minor errors, mostly professional
- C: Multiple errors or compliance issues
- D: Unprofessional or discriminatory language

---

NOW WRITE A PROFESSIONAL REWRITE following these STRICT RULES:
1. Length: EXACTLY 140-160 words. Count carefully.
2. Structure:
   - Opening hook (1-2 sentences painting the lifestyle/emotion)
   - Key features (3-4 sentences with specifics: beds/baths, sqft, standout amenities)
   - Location/lifestyle benefits (2-3 sentences: schools, dining, commute, neighborhood vibe)
   - Closing CTA (1 sentence with urgency)
3. Style:
   - Active voice, present tense
   - Short, punchy sentences (10-15 words average)
   - Sensory details (what they'll see, feel, experience)
   - Buyer psychology (appeal to emotions: safety, pride, comfort, status)
4. SEO Keywords to include naturally:
   - Neighborhood name
   - School district (if applicable)
   - Lifestyle keywords (walkable, entertaining, etc.)
   - Unique features (pool, fireplace, hardwood, etc.)
5. Fair Housing Compliance:
   - NO: family-oriented, perfect for families, great for kids, quiet neighborhood, young professionals
   - YES: spacious layout, open floor plan, fenced yard, near schools, walkable area
6. Forbidden words/phrases:
   - "Must see" / "Won't last" (unless backed by urgency reason)
   - "Cozy" (means small)
   - "Fixer-upper" / "TLC" (negative)
   - "Motivated seller" (sounds desperate)
7. Power words to use:
   - Stunning, pristine, immaculate, sprawling, sun-drenched, chef's kitchen, spa-like, resort-style, entertainer's dream

---

PROVIDE 3 ACTIONABLE RECOMMENDATIONS:
- Be specific (not "improve description" but "Add square footage and lot size to opening")
- Focus on what will increase showings/offers
- Prioritize highest-impact changes

---

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "overall": "B",
  "categories": {
    "headline": {"grade": "C", "feedback": "Too generic. Add specific feature like Pool or Waterfront."},
    "length": {"grade": "B", "feedback": "145 words - perfect length for MLS."},
    "emotion": {"grade": "C", "feedback": "Lacks sensory details. Paint a picture of the lifestyle."},
    "keywords": {"grade": "D", "feedback": "Missing neighborhood name and school district."},
    "cta": {"grade": "B", "feedback": "CTA present but lacks urgency."},
    "professionalism": {"grade": "A", "feedback": "Grammar and compliance are solid."}
  },
  "rewrite": "Your 140-160 word MLS-ready rewrite here...",
  "recommendations": [
    "Add square footage and lot size in the opening sentence",
    "Include neighborhood name and top-rated school district for SEO",
    "Replace closing with specific urgency driver like Open house this Saturday only"
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an elite real estate copywriter with 20 years of experience writing high-converting MLS listings. You follow NAR guidelines, Fair Housing laws, and MLS best practices. You always return valid JSON without markdown formatting.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const responseText = completion.choices[0].message.content || '{}';
  const cleanedText = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  return JSON.parse(cleanedText);
}
