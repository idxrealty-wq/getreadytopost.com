import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

function safeJsonParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function buildFactsBlock(propertyDetails: any): string {
  const pd = propertyDetails || {};
  const lines: string[] = [];
  const add = (label: string, val: any) => {
    if (val === undefined || val === null) return;
    const s = String(val).trim();
    if (!s) return;
    lines.push(`${label}: ${s}`);
  };

  add("Address", pd.address);
  add("City", pd.city);
  add("State", pd.state);
  add("ZIP", pd.zip);
  add("Property Type", pd.propertyType);
  add("Bedrooms", pd.beds);
  add("Bathrooms", pd.baths);
  add("Square Feet", pd.sqft);
  add("Lot Size", pd.lotSize);
  add("Year Built", pd.yearBuilt);
  add("Price", pd.price);
  add("Features", pd.features);

  return lines.length ? lines.join("\n") : "None provided.";
}

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || "OpenAI request failed");
  }

  const text = data?.choices?.[0]?.message?.content || "";
  return String(text).trim();
}

async function ensureRewriteLength(rewrite: string, factsBlock: string): Promise<string> {
  let current = (rewrite || "").trim();
  for (let i = 0; i < 3; i++) {
    const wc = countWords(current);
    if (wc >= 140 && wc <= 160) return current;

    const tightenPrompt = [
      "You are an elite MLS listing copywriter.",
      "You MUST follow the facts. Do NOT invent beds, baths, square footage, upgrades, HOA, views, waterfront, or any features not explicitly provided.",
      "If facts are missing, use neutral phrasing (e.g., 'spacious layout') without adding numbers.",
      "",
      "FACTS (ONLY use these):",
      factsBlock,
      "",
      `Your previous rewrite was ${wc} words.`,
      "Rewrite again to be BETWEEN 140 and 160 words (target 150).",
      "MLS-safe, Fair Housing safe. No emojis. No ALL CAPS. No URLs. No agent contact info.",
      "Return ONLY the rewritten text.",
    ].join("\n");

    current = await callOpenAI(tightenPrompt);
  }
  return current;
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const body = await req.json();
    const { submissionId } = body || {};

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const docSnap = await db.collection("submissions").doc(submissionId).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission: any = docSnap.data() || {};
    const listingText = submission.listingText || "";
    const propertyDetails = submission.propertyDetails || {};

    if (!listingText) {
      return NextResponse.json({ error: "No listing text in submission" }, { status: 400 });
    }

    const factsBlock = buildFactsBlock(propertyDetails);

    // 1) Grade JSON
    const gradingPrompt = [
      "You are a strict MLS listing grader.",
      "Return ONLY valid JSON with keys: headline, length, emotion, keywords, cta, compliance.",
      "Each key must be an object: { grade: \"A|B|C|D|F\", notes: \"...\" }",
      "Be strict. Do not give A unless it fully meets criteria.",
      "",
      "FACTS (context only):",
      factsBlock,
      "",
      "LISTING:",
      listingText,
    ].join("\n");

    const gradingRaw = await callOpenAI(gradingPrompt);
    const grades = safeJsonParse(gradingRaw) || {};

    // 2) Rewrite
    const rewritePrompt = [
      "You are an elite MLS listing copywriter.",
      "You MUST follow the facts. Do NOT invent beds, baths, square footage, upgrades, HOA, views, waterfront, or any features not explicitly provided.",
      "If facts are missing, use neutral phrasing (e.g., 'spacious layout') without adding numbers.",
      "",
      "FACTS (ONLY use these):",
      factsBlock,
      "",
      "Rewrite the listing to exactly 150 words.",
      "MLS-safe, Fair Housing safe. No emojis. No ALL CAPS. No URLs. No agent contact info.",
      "Return ONLY the rewritten text.",
      "",
      "LISTING:",
      listingText,
    ].join("\n");

    let rewrite = await callOpenAI(rewritePrompt);
    rewrite = await ensureRewriteLength(rewrite, factsBlock);
    const rewriteWordCount = countWords(rewrite);

    // 3) Build analysis object in the format results page expects
    const analysis = {
      overall: grades.headline?.grade || "B",
      rewrite,
      rewriteWordCount,
      categories: {
        headline: grades.headline || { grade: "B", notes: "" },
        length: grades.length || { grade: "B", notes: "" },
        emotion: grades.emotion || { grade: "B", notes: "" },
        keywords: grades.keywords || { grade: "B", notes: "" },
        cta: grades.cta || { grade: "B", notes: "" },
        compliance: grades.compliance || { grade: "B", notes: "" },
      },
      recommendations: [
        "Review the rewrite for tone and accuracy",
        "Test the listing on your MLS platform",
        "Consider A/B testing with your original",
      ],
    };

    // 4) Update submission doc with analysis
    await db.collection("submissions").doc(submissionId).update({
      status: "completed",
      analysis,
      analyzedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      submissionId,
      analysis,
    });
  } catch (e: any) {
    console.error("run-analysis error:", e);
    return NextResponse.json(
      { error: e?.message || "Run analysis failed" },
      { status: 500 }
    );
  }
}
