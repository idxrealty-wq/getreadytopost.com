import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Resend } from "resend";

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

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  initAdmin();
  const db = getFirestore();

  try {
    const { submissionId } = await req.json();
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId required" }, { status: 400 });
    }

    const submissionRef = db.collection("submissions").doc(submissionId);
    const submissionDoc = await submissionRef.get();
    if (!submissionDoc.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const data = submissionDoc.data() || {};
    const listingText = String(data.listingText || "");
    const email = String(data.email || "");

    await submissionRef.update({ status: "processing" });

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer \${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a real estate listing expert. Analyze the listing and return ONLY a valid JSON object with this exact structure, no markdown, no explanation: { "overall": "A", "rewrite": "Your improved listing text here", "categories": { "headline": { "grade": "A", "feedback": "feedback text" }, "length": { "grade": "B", "feedback": "feedback text" }, "emotion": { "grade": "A", "feedback": "feedback text" }, "keywords": { "grade": "B", "feedback": "feedback text" }, "cta": { "grade": "A", "feedback": "feedback text" }, "professionalism": { "grade": "A", "feedback": "feedback text" } }, "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"] }`,
          },
          {
            role: "user",
            content: `Analyze this real estate listing:\n\n\${listingText}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      await submissionRef.update({ status: "error", error: err });
      return NextResponse.json({ error: "OpenAI failed" }, { status: 500 });
    }

    const openaiData = await openaiRes.json();
    const rawContent = openaiData.choices?.[0]?.message?.content || "{}";
    const analysis = safeJsonParse(rawContent);

    if (!analysis) {
      await submissionRef.update({
        status: "error",
        error: "Failed to parse OpenAI JSON",
        rawContent,
      });
      return NextResponse.json({ error: "Bad OpenAI JSON" }, { status: 500 });
    }

    await submissionRef.update({
      status: "completed",
      analysis,
      completedAt: new Date().toISOString(),
    });

    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const overall = String(analysis.overall || "");
        const rewrite = String(analysis.rewrite || "");
        const recs = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];

        const html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;"><h2 style="color: #333;">Your GetReadyToPost Listing Report</h2><p style="font-size: 16px;"><strong>Overall Grade:</strong> <span style="font-size: 24px; color: #4CAF50; font-weight: bold;">\${overall}</span></p><hr style="border: none; border-






