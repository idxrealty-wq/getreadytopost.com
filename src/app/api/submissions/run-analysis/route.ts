import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { checkCompliance } from "@/lib/grading/complianceDb";
import { scoreLength } from "@/lib/grading/lengthScoring";
import { scoreKeywords } from "@/lib/grading/keywordScoring";
import { scoreStructure } from "@/lib/grading/structureScoring";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (admin.apps.length) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");

  let sa: any;
  try {
    sa = JSON.parse(raw);
  } catch (e: any) {
    throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON: ${e?.message || e}`);
  }

  if (!sa.private_key || typeof sa.private_key !== "string") {
    throw new Error('Service account object must contain a string "private_key" property.');
  }

  sa.private_key = sa.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(sa),
  });
}

function safeTrim(x: any) {
  return String(x || "").trim();
}

function buildFactsBlock(pd: any): string {
  const lines: string[] = [];
  const add = (label: string, val: any) => {
    if (val === undefined || val === null) return;
    const s = String(val).trim();
    if (!s) return;
    lines.push(`${label}: ${s}`);
  };

  add("Address", pd?.address);
  add("City", pd?.city);
  add("State", pd?.state);
  add("Zip", pd?.zip);
  add("Bedrooms", pd?.beds);
  add("Bathrooms", pd?.baths);
  add("Square Feet", pd?.sqft);
  add("Year Built", pd?.yearBuilt);
  add("Lot Size", pd?.lotSize);
  add("Property Type", pd?.propertyType);
  add("Price", pd?.price);
  add("HOA", pd?.hoa);

  return lines.length ? lines.join("\n") : "None provided.";
}

function buildNearbyFactsBlock(nearby: any): string {
  if (!nearby || typeof nearby !== "object") return "";

  const categories = [
    "Schools",
    "Grocery",
    "Parks",
    "Medical",
    "Restaurants",
    "Golf",
    "Entertainment",
    "Gas",
    "Shopping",
    "Utilities",
  ];

  const lines: string[] = [];

  for (const cat of categories) {
    const arr = (nearby as any)[cat];
    if (!Array.isArray(arr) || arr.length === 0) continue;

    const places = arr
      .slice(0, 3)
      .map((p: any) => p?.name)
      .filter(Boolean)
      .join(", ");

    if (places) lines.push(`${cat}: ${places}`);
  }

  return lines.length ? lines.join("\n") : "";
}

function mergeFactsBlocks(baseFacts: string, nearbyFacts: string): string {
  const b = safeTrim(baseFacts);
  const n = safeTrim(nearbyFacts);
  if (!n) return b || "None provided.";
  if (!b) return `NEARBY (provided facts only):\n${n}`;
  return `${b}\n\nNEARBY (provided facts only):\n${n}`;
}

async function callOpenAI(key: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${txt ? `- ${txt}` : ""}`.trim());
  }

  const data = await res.json();
  return safeTrim(data?.choices?.[0]?.message?.content);
}

type AiRubricResult = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  evidence: string[];
  feedback: string;
};

function clampScore(x: any): number {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function normalizeGrade(g: any): "A" | "B" | "C" | "D" | "F" {
  const x = String(g || "").toUpperCase().trim();
  if (x === "A" || x === "B" || x === "C" || x === "D" || x === "F") return x;
  return "F";
}
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

  let response = await callOpenAI(
    key,
    "You are an expert MLS listing grader. Return ONLY valid JSON.",
    prompt
  );

  response = response
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const parsed = JSON.parse(response);
    return {
      score: clampScore(parsed.score),
      grade: normalizeGrade(parsed.grade),
      evidence: Array.isArray(parsed.evidence)
        ? parsed.evidence.map((x: any) => String(x)).slice(0, 4)
        : [],
      feedback: safeTrim(parsed.feedback),
    };
  } catch (e: any) {
    console.error("[run-analysis] AI JSON parse error:", e?.message);
    console.error("[run-analysis] AI raw response:", response);
    return {
      score: 60,
      grade: "C",
      evidence: [],
      feedback: "AI scoring returned invalid JSON.",
    };
  }
}

async function generateRewrite(
  key: string,
  listing: string,
  factsBlock: string
): Promise<string> {
  const basePrompt = `You are an elite MLS listing rewriter optimizing for conversion AND for an A-grade rubric.

HARD RULES:
- Use ONLY facts provided in PROPERTY FACTS or ORIGINAL (do not invent schools, distances, upgrades, views, or neighborhood claims).
- 145–165 words total (headline + paragraph combined).
- MLS + Fair Housing safe language. Avoid: "master", "great schools", "safe neighborhood", "perfect for families", or anything implying protected classes.
- No ALL CAPS. No emojis. No excessive punctuation.

OUTPUT FORMAT (exactly):
Line 1: A short MLS-safe headline (6–10 words, Title Case).
Line 2+: One tight paragraph (no bullets) that includes:
  - An emotional hook in the first sentence (lifestyle benefit + property benefit)
  - Beds/Baths/Sq Ft if provided
  - 2–4 strongest features from the original (roof, updates, porch, garage, golf course, etc.)
  - A location convenience sentence (airport/shopping/attractions/beach ONLY if present in ORIGINAL)
  - End with a clear CTA: "Schedule your private showing today."

PROPERTY FACTS:
${factsBlock}

ORIGINAL:
${listing}

Return ONLY the rewritten listing text.`.trim();

  const system =
    "You are an elite MLS listing rewriter. Follow the output format exactly. Return ONLY the rewritten listing text.";

  const clean = (t: string) =>
    t
      .trim()
      .replace(/^```[a-z]*\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

  const wordCount = (t: string) =>
    clean(t)
      .split(/\s+/)
      .filter(Boolean).length;

  let text = clean(await callOpenAI(key, system, basePrompt));
  let wc = wordCount(text);

  console.log(`[generateRewrite] Pass 1 word count: ${wc}`);

  if (wc < 145 || wc > 165) {
    console.log(
      `[generateRewrite] Word count ${wc} outside target 145–165. Running repair pass...`
    );

    const repairPrompt = `Your previous rewrite did not meet the required word count (target: 145–165 words).

TASK:
- Keep the EXACT output format (headline line 1, single paragraph line 2+).
- Do NOT add any new facts beyond PROPERTY FACTS or ORIGINAL.
- If too short: expand by adding 2–4 factual feature phrases already present in ORIGINAL, and add 1 sentence of MLS-safe lifestyle benefit that is supported by the facts.
- If too long: tighten wording without removing key facts.
- Keep the CTA EXACTLY: "Schedule your private showing today."

PROPERTY FACTS:
\${factsBlock}

ORIGINAL:
\${listing}

CURRENT REWRITE (\${wc} words):
\${text}

Return ONLY the corrected rewritten listing text.`.trim();

    text = clean(await callOpenAI(key, system, repairPrompt));
    wc = wordCount(text);
    console.log(`[generateRewrite] Pass 2 word count: \${wc}`);
  }

  return clean(text);
}

function scoreToLetter(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function computeOverallScore(parts: {
  compliance: number;
  length: number;
  keywords: number;
  structure: number;
  emotionalAppeal: number;
  clarity: number;
  buyerFocus: number;
}): number {
  const keywords100 = Math.max(0, Math.min(100, (parts.keywords / 50) * 100));
  return (
    parts.compliance * 0.25 +
    parts.length * 0.15 +
    keywords100 * 0.05 +
    parts.structure * 0.12 +
    parts.emotionalAppeal * 0.18 +
    parts.clarity * 0.15 +
    parts.buyerFocus * 0.1
  );
}

async function deductCreditsIfNeeded(
  db: any,
  userId: string,
  submissionId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const ref = db.collection("submissions").doc(submissionId);
    const snap = await ref.get();
    const data = snap.data() || {};

    if (data.creditUsed === true) {
      console.log(`[run-analysis] Submission \${submissionId} already deducted. Skipping.`);
      return { ok: true };
    }

    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.URL ||
      "http://localhost:3000";
    const url = new URL("/api/credits/deduct", base).toString();

    const deductRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, submissionId }),
    });

    if (!deductRes.ok) {
      let errMsg = "Deduct failed";
      try {
        const errData = await deductRes.json();
        errMsg = errData?.error || errMsg;
      } catch {}
      return { ok: false, error: errMsg };
    }

    const result = await deductRes.json();
    console.log(`[run-analysis] Credit deducted. New balance: \${result?.newBalance}`);
    return { ok: true };
  } catch (e: any) {
    console.error("[run-analysis] Deduct error:", e?.message);
    return { ok: false, error: e?.message || "Deduct error" };
  }
}
export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = admin.firestore();

    const body = await req.json();
    const submissionId = safeTrim(body?.submissionId);

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId is required" },
        { status: 400 }
      );
    }

    console.log(`[run-analysis] Starting analysis for submission: ${submissionId}`);

    const ref = db.collection("submissions").doc(submissionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const data = snap.data() || {};
    console.log(`[run-analysis] Submission data loaded:`, {
      hasListingText: !!data.listingText,
      hasPropertyDetails: !!data.propertyDetails,
      hasNearby: !!data.nearby,
      hasAnalysis: !!data.analysis,
    });

    // If already analyzed, return cached
    if (data.analysis?.rewrite?.text) {
      console.log(`[run-analysis] Submission already analyzed. Returning cached.`);
      return NextResponse.json({
        ok: true,
        submissionId,
        analysis: data.analysis,
        rewriteText: data.analysis.rewrite.text,
      });
    }

    const listingText = safeTrim(data.listingText);
    const baseFacts = buildFactsBlock(data.propertyDetails || {});
    const nearbyFacts = buildNearbyFactsBlock(data.nearby);
    const factsBlock = mergeFactsBlocks(baseFacts, nearbyFacts);

    const openaiKey = process.env.OPENAI_API_KEY || "";
    if (!openaiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // Update status to processing
    await ref.update({ status: "processing", startedAt: new Date().toISOString() });

    // Deduct credits (idempotent) — use uid if present, else email
    const uid = safeTrim(data.uid || data.userId || data.email);
    if (!uid) {
      await ref.update({
        status: "failed",
        error: "Missing uid/email on submission",
      });
      return NextResponse.json(
        { error: "Missing uid/email on submission" },
        { status: 400 }
      );
    }

    const creditCheck = await deductCreditsIfNeeded(db, uid, submissionId);
    if (!creditCheck.ok) {
      await ref.update({ status: "failed", error: creditCheck.error });
      return NextResponse.json({ error: creditCheck.error }, { status: 400 });
    }

    console.log(`[run-analysis] Credits deducted. Scoring original listing...`);

    // Score original
    const complianceResult = checkCompliance(listingText);
    const lengthResult = scoreLength(listingText);
    const keywordsResult = scoreKeywords(listingText);
    const structureResult = scoreStructure(listingText);

    console.log(`[run-analysis] Calling AI for emotional_appeal...`);
    const emotionalAppeal = await scoreWithAI(
      openaiKey,
      "emotional_appeal",
      listingText,
      factsBlock
    );

    console.log(`[run-analysis] Calling AI for clarity...`);
    const clarity = await scoreWithAI(openaiKey, "clarity", listingText, factsBlock);

    console.log(`[run-analysis] Calling AI for buyer_focus...`);
    const buyerFocus = await scoreWithAI(
      openaiKey,
      "buyer_focus",
      listingText,
      factsBlock
    );

    const originalScore = computeOverallScore({
      compliance: complianceResult.score,
      length: lengthResult.score,
      keywords: keywordsResult.score,
      structure: structureResult.score,
      emotionalAppeal: emotionalAppeal.score,
      clarity: clarity.score,
      buyerFocus: buyerFocus.score,
    });

    let originalGrade = scoreToLetter(originalScore);
    if (complianceResult.grade === "F") originalGrade = "D";

    console.log(`[run-analysis] Original score: ${originalScore.toFixed(1)}, grade: ${originalGrade}`);

    // Generate rewrite
    console.log(`[run-analysis] Generating rewrite...`);
    const rewriteText = await generateRewrite(openaiKey, listingText, factsBlock);

    if (!rewriteText) {
      throw new Error("Rewrite generation returned empty text");
    }

    console.log(`[run-analysis] Rewrite generated (${rewriteText.length} chars). Scoring rewrite...`);

    // Score rewrite
    const rewriteComplianceResult = checkCompliance(rewriteText);
    const rewriteLengthResult = scoreLength(rewriteText);
    const rewriteKeywordsResult = scoreKeywords(rewriteText);
    const rewriteStructureResult = scoreStructure(rewriteText);

    console.log(`[run-analysis] Calling AI for rewrite emotional_appeal...`);
    const rewriteEmotionalAppeal = await scoreWithAI(
      openaiKey,
      "emotional_appeal",
      rewriteText,
      factsBlock
    );

    console.log(`[run-analysis] Calling AI for rewrite clarity...`);
    const rewriteClarity = await scoreWithAI(
      openaiKey,
      "clarity",
      rewriteText,
      factsBlock
    );

    console.log(`[run-analysis] Calling AI for rewrite buyer_focus...`);
    const rewriteBuyerFocus = await scoreWithAI(
      openaiKey,
      "buyer_focus",
      rewriteText,
      factsBlock
    );

    const rewriteScore = computeOverallScore({
      compliance: rewriteComplianceResult.score,
      length: rewriteLengthResult.score,
      keywords: rewriteKeywordsResult.score,
      structure: rewriteStructureResult.score,
      emotionalAppeal: rewriteEmotionalAppeal.score,
      clarity: rewriteClarity.score,
      buyerFocus: rewriteBuyerFocus.score,
    });

    let rewriteGrade = scoreToLetter(rewriteScore);
    if (rewriteComplianceResult.grade === "F") rewriteGrade = "D";

    console.log(`[run-analysis] Rewrite score: ${rewriteScore.toFixed(1)}, grade: ${rewriteGrade}`);
    const analysis = {
      original: {
        overall: originalGrade,
        categories: {
          headline: {
            grade: structureResult.openingHook ? "B" : "C",
            feedback: structureResult.openingHook
              ? "Opening hook present."
              : "Opening hook missing or weak.",
          },
          length: { grade: lengthResult.grade, feedback: lengthResult.auditTrail },
          emotion: emotionalAppeal,
          keywords: { grade: keywordsResult.grade, feedback: keywordsResult.auditTrail },
          cta: {
            grade: structureResult.callToAction ? "B" : "C",
            feedback: structureResult.callToAction ? "CTA present." : "No clear CTA.",
          },
          compliance: {
            grade: complianceResult.grade,
            feedback: complianceResult.auditTrail,
          },
        },
      },
      rewrite: {
        overall: rewriteGrade,
        text: rewriteText,
        wordCount: rewriteText.split(/\s+/).filter(Boolean).length,
        categories: {
          headline: {
            grade: rewriteStructureResult.openingHook ? "A" : "B",
            feedback: rewriteStructureResult.openingHook
              ? "Strong opening hook present."
              : "Opening hook could be stronger.",
          },
          length: { grade: rewriteLengthResult.grade, feedback: rewriteLengthResult.auditTrail },
          emotion: rewriteEmotionalAppeal,
          keywords: { grade: rewriteKeywordsResult.grade, feedback: rewriteKeywordsResult.auditTrail },
          cta: {
            grade: rewriteStructureResult.callToAction ? "A" : "B",
            feedback: rewriteStructureResult.callToAction
              ? "Clear, actionable CTA present."
              : "CTA could be stronger.",
          },
          compliance: {
            grade: rewriteComplianceResult.grade,
            feedback: rewriteComplianceResult.auditTrail,
          },
        },
      },
    };

    // Save analysis + rewrite to Firestore BEFORE returning
    const updatePayload = {
      status: "completed",
      completedAt: new Date().toISOString(),
      rubricVersion: "2.0.1",
      analysis,
    };

    await ref.update(updatePayload);

    console.log(`[run-analysis] Saved analysis to Firestore. Returning response.`);

    // Return analysis + rewriteText so UI doesn't need to race Firestore
    return NextResponse.json({
      ok: true,
      submissionId,
      analysis,
      rewriteText: analysis.rewrite.text,
    });
  } catch (e: any) {
    console.error("[run-analysis] Fatal:", e?.message);
    console.error("[run-analysis] Stack:", e?.stack);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
