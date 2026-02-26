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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a strict real estate listing grader and rewriter. Return ONLY valid JSON (no markdown, no commentary). You MUST grade the listing in EXACTLY these 6 categories: 1) headline 2) length 3) emotion 4) keywords 5) cta 6) compliance. GRADING SCALE (A,B,C,D,F): A = excellent, B = good, C = fair, D = poor, F = failing. HEADLINE (opening 1–2 sentences): A = property-specific hook + differentiator (location + standout feature) with minimal hype. B = decent hook but generic phrasing or missing differentiator. C = flat/neutral opening. D = confusing or buried lead. F = missing/unusable. LENGTH (word count): A = 140–160 words. B = 120–139 or 161–180. C = 100–119 or 181–220. D = 70–99 or 221–280. F = <70 or >280. EMOTION (buyer psychology): A = benefits + lifestyle + sensory detail. B = some lifestyle framing, still feature-heavy. C = mostly feature list. D = dry/robotic. F = incoherent. KEYWORDS (searchability): A = property type + location cues + top features + lifestyle terms naturally. B = good features but missing property type or location. C = sparse keywords. D = weak terms. F = irrelevant. CTA (call to action): A = clear next step (schedule showing / request tour / contact agent). B = CTA present but weak. C = indirect CTA. D = vague. F = none. COMPLIANCE (Fair Housing + MLS): A = MLS-safe, factual, no discriminatory language, no errors. B = minor hype, still safe. C = multiple hype claims or steering-risk phrasing. D = major credibility issues. F = Fair Housing violation or discriminatory language. Fair Housing: Flag "perfect for families", "young professionals", "safe neighborhood", "ideal for students", "no Section 8", or protected class references. MLS: Avoid contact info, URLs, emojis, ALL CAPS spam. OUTPUT JSON: {"overall":"A|B|C|D|F","rewrite":"140-160 word MLS-ready rewrite with PRIMARY bedroom and clear CTA","categories":{"headline":{"grade":"A|B|C|D|F","feedback":"..."},"length":{"grade":"A|B|C|D|F","feedback":"..."},"emotion":{"grade":"A|B|C|D|F","feedback":"..."},"keywords":{"grade":"A|B|C|D|F","feedback":"..."},"cta":{"grade":"A|B|C|D|F","feedback":"..."},"compliance":{"grade":"A|B|C|D|F","feedback":"..."}},"recommendations":["...","...","..."]}. Be strict. Do not give A unless it truly meets A criteria. If missing key basics (beds/baths, property type, or extremely short), grades must drop.MANDATORY REWRITE LENGTH: Your rewrite MUST be exactly 140-160 words. This is non-negotiable. Count every single word in your rewrite before returning it. If it is under 140 words, you MUST expand it by adding more lifestyle details, sensory language, buyer benefits, or property features until it reaches at least 140 words. If it exceeds 160 words, trim it down. Do not return the JSON unless the rewrite word count is between 140-160 inclusive....`,
          },
          {
            role: "user",
            content: `Analyze this real estate listing:\n\n${listingText}`,
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

    await submissionRef.update({
      status: "completed",
      analysis,
      completedAt: new Date().toISOString(),
      email,
    });

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

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 40px 20px; text-align: center; color: white;"><h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">GetReadyToPost</h1><p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Real Estate Listing Analysis Report</p></div><div style="background-color: #ecf0f1; padding: 30px 20px; text-align: center;"><p style="margin: 0 0 15px 0; color: #7f8c8d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Overall Grade</p><div style="display: inline-block; width: 100px; height: 100px; border-radius: 50%; background-color: ${gradeColor}; display: flex; align-items: center; justify-content: center;"><span style="font-size: 48px; font-weight: 700; color: white;">${overall}</span></div></div><div style="padding: 30px 20px;"><div style="margin-bottom: 30px;"><h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: 600; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Professional Rewrite</h2><p style="margin: 0; color: #34495e; line-height: 1.8; font-size: 14px; white-space: pre-wrap; background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db;">${rewrite}</p></div><div style="margin-bottom: 30px;"><h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: 600; border-bottom: 3px solid #e74c3c; padding-bottom: 10px;">Key Recommendations</h2><ol style="margin: 0; padding-left: 20px; color: #34495e;">${recs
          .map(
            (rec: string) =>
              `<li style="margin: 12px 0; color: #2c3e50; line-height: 1.6;">${rec}</li>`
          )
          .join("")}</ol></div><div style="text-align: center; margin: 30px 0;"><a href="https://getreadytopost.com/results?id=${submissionId}" style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);">View Full Report</a></div></div><div style="background-color: #ecf0f1; padding: 20px; text-align: center; border-top: 1px solid #bdc3c7;"><p style="margin: 0; color: #7f8c8d; font-size: 12px;"><strong>GetReadyToPost</strong> — Real Estate Listing Analysis<br><span style="opacity: 0.7;">Helping agents and sellers create winning listings</span></p></div></div></body></html>`;

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: `Your GetReadyToPost Report - Grade ${overall}`,
          html,
        });

        await submissionRef.update({
          emailSendStatus: "sent",
          emailSentAt: new Date().toISOString(),
        });
      } catch (e: any) {
        console.error("Email send error:", e);
        await submissionRef.update({
          emailSendStatus: "error",
          emailSendError: String(e?.message || e),
        });
      }
    } else {
      await submissionRef.update({
        emailSendStatus: email ? "missing_resend_key" : "missing_email",
      });
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Run analysis error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}
