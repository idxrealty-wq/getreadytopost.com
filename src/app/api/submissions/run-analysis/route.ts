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

async function ensureRewriteLength(
  rewrite: string,
  key: string,
  factsBlock: string
): Promise<string> {
  let current = rewrite;

  for (let i = 0; i < 3; i++) {
    const wc = countWords(current);
    if (wc >= 145 && wc <= 165) return current;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an elite MLS listing copywriter. You MUST follow the facts. Do NOT invent beds, baths, square footage, upgrades, HOA, views, waterfront, or any features not explicitly provided. If facts are missing, use neutral phrasing (e.g., 'spacious layout') without adding numbers. Rewrite to 155 words (145–165 allowed). MLS-safe, Fair Housing safe. Return ONLY the rewritten text.",
          },
          {
            role: "user",
            content: `FACTS (only use these; do not add new facts):\n${factsBlock}\n\nRewrite this to 155 words (145–165 allowed):\n\n${current}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) return current;
    const data = await res.json();
    current = String(data.choices?.[0]?.message?.content || current).trim();
  }

  return current;
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
    const propertyDetails = data.propertyDetails || {};
    const factsBlock = buildFactsBlock(propertyDetails);

    await submissionRef.update({ status: "processing" });

    const openaiKey = String(process.env.OPENAI_API_KEY || "");
    if (!openaiKey) {
      await submissionRef.update({ status: "error", error: "Missing OPENAI_API_KEY" });
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a strict real estate listing grader and rewriter targeting A-grade output.

CRITICAL FACT RULE: You may ONLY use facts in the FACTS block and the user's original listing text. DO NOT invent beds, baths, square footage, lot size, year built, HOA, fees, views, waterfront, renovations, appliances, school zones, distances, or neighborhood claims. If a fact is missing, do NOT guess. Use neutral phrasing without numbers.

You MUST grade EXACTLY these 6 categories: 1) headline 2) length 3) emotion 4) keywords 5) cta 6) compliance

GRADING SCALE: A, B, C, D, F (be strict — only A if all criteria met).

A-GRADE REWRITE REQUIREMENTS:
- 145–165 words inclusive (count words before returning)
- MLS-safe, Fair Housing safe
- Use "primary bedroom" (not "master")
- Clear CTA (schedule a showing / see it today)
- Buyer-focused benefits + clean scan-friendly flow
- Strong keyword coverage (location, property type, key features, amenities)

A-GRADE STRUCTURE (use this every time):
1) Hook (location + strongest differentiator + lifestyle benefit)
2) Location perks (parks/transit/amenities if provided)
3) Main level highlights (beds/baths + key features like fireplaces, decks, skylights, garage)
4) Flex space (guest/office; note if unwarranted)
5) Outdoor/entertaining (decks/patio/hot tub/etc. if provided)
6) Build year (if provided) + CTA

Return ONLY valid JSON (no markdown, no commentary).

OUTPUT JSON SHAPE:
{
  "overall": "A|B|C|D|F",
  "rewrite": "145-165 word MLS-ready rewrite (no invented facts).",
  "categories": {
    "headline": { "grade": "A|B|C|D|F", "feedback": "..." },
    "length": { "grade": "A|B|C|D|F", "feedback": "..." },
    "emotion": { "grade": "A|B|C|D|F", "feedback": "..." },
    "keywords": { "grade": "A|B|C|D|F", "feedback": "..." },
    "cta": { "grade": "A|B|C|D|F", "feedback": "..." },
    "compliance": { "grade": "A|B|C|D|F", "feedback": "..." }
  },
  "recommendations": ["...", "...", "..."]
}`,
          },
          {
            role: "user",
            content: `FACTS (only use these; do not add new facts):\n${factsBlock}\n\nORIGINAL LISTING TEXT:\n${listingText}`,
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
    const rawContent = String(openaiData.choices?.[0]?.message?.content || "{}");

    const unfenced = rawContent
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = unfenced.indexOf("{");
    const lastBrace = unfenced.lastIndexOf("}");
    const candidate =
      firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
        ? unfenced.slice(firstBrace, lastBrace + 1)
        : unfenced;

    const analysis = safeJsonParse(candidate);

    if (!analysis) {
      await submissionRef.update({
        status: "error",
        error: "Failed to parse OpenAI JSON",
        rawContent,
      });
      return NextResponse.json({ error: "Bad OpenAI JSON" }, { status: 500 });
    }

    analysis.rewrite = await ensureRewriteLength(
      String(analysis.rewrite || ""),
      openaiKey,
      factsBlock
    );
    analysis.rewriteWordCount = countWords(String(analysis.rewrite || ""));

    await submissionRef.update({
      status: "completed",
      analysis,
      completedAt: new Date().toISOString(),
      email,
      propertyDetails,
    });

    // Email report (optional)
    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const overall = String(analysis.overall || "");
        const rewrite = String(analysis.rewrite || "");
        const recs: string[] = Array.isArray(analysis.recommendations)
          ? (analysis.recommendations as string[])
          : [];

        const gradeColor =
          overall === "A"
            ? "#27ae60"
            : overall === "B"
            ? "#f39c12"
            : overall === "C"
            ? "#e74c3c"
            : overall === "D"
            ? "#c0392b"
            : "#95a5a6";

        const html = `<!DOCTYPE html><html><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head><body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#2c3e50 0%,#34495e 100%);padding:40px 20px;text-align:center;color:white;">
      <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;">GetReadyToPost</h1>
      <p style="margin:8px 0 0 0;font-size:14px;opacity:0.9;">Real Estate Listing Analysis Report</p>
    </div>
    <div style="background-color:#ecf0f1;padding:30px 20px;text-align:center;">
      <p style="margin:0 0 15px 0;color:#7f8c8d;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Overall Grade</p>
      <div style="display:inline-block;width:100px;height:100px;border-radius:50%;background-color:${gradeColor};display:flex;align-items:center;justify-content:center;">
        <span style="font-size:48px;font-weight:700;color:white;">${overall}</span>
      </div>
    </div>
    <div style="padding:30px 20px;">
      <div style="margin-bottom:30px;">
        <h2 style="margin:0 0 15px 0;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:3px solid #3498db;padding-bottom:10px;">Professional Rewrite</h2>
        <p style="margin:0;color:#34495e;line-height:1.8;font-size:14px;white-space:pre-wrap;background-color:#f8f9fa;padding:15px;border-radius:6px;border-left:4px solid #3498db;">${rewrite}</p>
      </div>
      <div style="margin-bottom:30px;">
        <h2 style="margin:0 0 15px 0;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:3px solid #e74c3c;padding-bottom:10px;">Key Recommendations</h2>
        <ol style="margin:0;padding-left:20px;color:#34495e;">
          ${recs.map((rec: string) => `<li style="margin:12px 0;color:#2c3e50;line-height:1.6;">${rec}</li>`).join("")}
        </ol>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://getreadytopost.com/results?id=${submissionId}"
           style="display:inline-block;background:linear-gradient(135deg,#3498db 0%,#2980b9 100%);color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;box-shadow:0 4px 6px rgba(52,152,219,0.3);">
          View Full Report
        </a>
      </div>
    </div>
    <div style="background-color:#ecf0f1;padding:20px;text-align:center;border-top:1px solid #bdc3c7;">
      <p style="margin:0;color:#7f8c8d;font-size:12px;">
        <strong>GetReadyToPost</strong> – Real Estate Listing Analysis<br>
        <span style="opacity:0.7;">Helping agents and sellers create winning listings</span>
      </p>
    </div>
  </div>
</body></html>`;

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: `Your GetReadyToPost Report - Grade \${overall}`,
          html,
        });
      } catch (e) {
        console.error("Email send failed:", e);
      }
    }

    return NextResponse.json({ ok: true, submissionId });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
