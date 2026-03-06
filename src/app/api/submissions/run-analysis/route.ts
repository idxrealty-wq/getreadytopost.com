async function scoreWithAI(
  key: string,
  category: "emotional_appeal" | "clarity" | "buyer_focus",
  listing: string,
  factsBlock: string
): Promise<AiRubricResult> {
  const rubrics: Record<string, string> = {
    emotional_appeal: `A (90-100): Vivid picture, sensory language, creates desire
B (75-89): Some lifestyle benefits, some emotional language
C (60-74): Mostly factual, minimal emotion
D (45-59): Dry, no lifestyle language
F (0-44): Negative or off-putting tone`,
    clarity: `A (90-100): Crystal clear, easy to scan, strong hierarchy
B (75-89): Clear with minor awkward phrasing
C (60-74): Understandable but dense/wordy
D (45-59): Confusing in places
F (0-44): Incomprehensible or misleading`,
    buyer_focus: `A (90-100): Strong buyer benefits and pain-point alignment
B (75-89): Some buyer benefits
C (60-74): Generic buyer language
D (45-59): Minimal buyer focus
F (0-44): Buyer-hostile/off-putting`,
  };

  const prompt = `Grade this listing on ${category.toUpperCase()} using the rubric below.
Return ONLY valid JSON:
{
  "score": <0-100>,
  "grade": "<A|B|C|D|F>",
  "evidence": ["quote 1", "quote 2"],
  "feedback": "explanation tied to the rubric"
}
RUBRIC:
${rubrics[category]}
FACTS:
${factsBlock}
LISTING:
${listing}`.trim();

  let response = await callOpenAI(key, "You are an expert MLS listing grader. Return ONLY valid JSON.", prompt);

  // Strip markdown code fences if the model wraps JSON
  response = response.trim();
  response = response.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
  response = response.replace(/\s*```\$/i, "");

  try {
    const parsed = JSON.parse(response);
    return {
      score: clampScore(parsed.score),
      grade: normalizeGrade(parsed.grade),
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence.map((x: any) => String(x)).slice(0, 4) : [],
      feedback: String(parsed.feedback || ""),
    };
  } catch (e) {
    console.error("[run-analysis] AI JSON parse error:", e);
    console.error("[run-analysis] AI raw response:", response);
    return { score: 60, grade: "C", evidence: [], feedback: "AI scoring returned invalid JSON." };
  }
}
async function generateRewrite(key: string, listing: string, factsBlock: string): Promise<string> {
  const prompt = `You are an elite MLS listing rewriter optimizing for conversion.
CONSTRAINTS:
- Use ONLY facts provided
- 145-165 words
- NO prohibited phrases (master bedroom -> primary bedroom, great schools -> remove)
- Open with emotional trigger + property benefit
- Close with a clear CTA (Schedule, Contact, Don't miss, etc.)
- Avoid ALL CAPS and excessive punctuation
PROPERTY FACTS:
${factsBlock}
ORIGINAL:
${listing}
Return ONLY the rewritten listing text.`.trim();

  let text = await callOpenAI(
    key,
    "You are an elite MLS listing rewriter. Return ONLY the rewritten listing text.",
    prompt
  );

  // Strip markdown code fences if present
  text = text.trim();
  text = text.replace(/^```[a-z]*\s*/i, "");
  text = text.replace(/\s*```$/i, "");

  return text.trim();
}

