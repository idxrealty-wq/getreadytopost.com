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

async function getLocationContext(address: string, city: string, state: string, zip: string): Promise<string> {
  try {
    const fullAddress = `${address}, ${city}, ${state} ${zip}`;
    const res = await fetch("https://getreadytopost.com/api/workspace/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: fullAddress }),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    const lines: string[] = [];
    if (data.neighborhood) lines.push(`Neighborhood: ${data.neighborhood}`);
    if (data.amenities && Array.isArray(data.amenities)) {
      lines.push(`Nearby: ${data.amenities.slice(0, 5).join(", ")}`);
    }
    if (data.commute) lines.push(`Commute: ${data.commute}`);
    return lines.length ? lines.join("\n") : "";
  } catch (e) {
    return "";
  }
}

async function ensureRewriteLength(
  rewrite: string,
  listingText: string,
  locationContext: string
): Promise<string> {
  let current = (rewrite || "").trim();
  
  for (let i = 0; i < 3; i++) {
    const wc = countWords(current);
    if (wc >= 140 && wc <= 160) return current;

    const tightenRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "Rewrite ONLY the listing. Keep MLS-safe and Fair Housing safe. No emojis, no ALL CAPS, no URLs, no agent contact info. Use any LOCATION CONTEXT provided. Return ONLY plain text. Target 150 words and MUST be between 140 and 160 words.",
          },
          {
            role: "user",
            content: `${locationContext ? `LOCATION CONTEXT (use only if provided):\n${locationContext}\n\n` : ""}ORIGINAL LISTING:\n${listingText}\n\nCURRENT REWRITE (${wc} words):\n${current}\n\nRewrite to be EXACTLY between 140 and 160 words.`,
          },
        ],
      }),
    });

    if (!tightenRes.ok) break;
    const tightenData = await tightenRes.json();
    const tightened = String(tightenData?.choices?.[0]?.message?.content || "").trim();
    if (tightened) current = tightened;
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

    if (!listingText) {
      return NextResponse.json({ error: "No listing text" }, { status: 400 });
    }

    await submissionRef.update({ status: "processing" });

    // Get location context from Maps
    const locationContext = await getLocationContext(
      propertyDetails.address || "",
      propertyDetails.city || "",
      propertyDetails.state || "",
      propertyDetails.zip || ""
    );

    const locationBlock = locationContext ? `LOCATION CONTEXT (from Google Maps, use only what's provided):\n${locationContext}\n\n` : "";

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
            content: `You are a strict real estate listing grader and rewriter. Return ONLY valid JSON (no markdown, no commentary). You MUST grade the listing in EXACTLY these 6 categories: 1) headline 2) length 3) emotion 4) keywords 5) cta 6) compliance. GRADING SCALE (A,B,C,D,F): A = excellent, B = good, C = fair, D = poor, F = failing. HEADLINE (opening 1–2 sentences): A = property-specific hook + differentiator (location + standout feature) with minimal hype. B = decent hook but generic phrasing or missing differentiator. C = flat/neutral opening. D = confusing or buried lead. F = missing/unusable. LENGTH (word count): A = 140–160 words. B = 120–139 or 161–180. C = 100–119 or 181–220. D = 70–99 or 221–280. F = <70 or >280. EMOTION (buyer psychology): A = benefits + lifestyle + sensory detail. B = some lifestyle framing, still feature-heavy. C = mostly feature list. D = dry/robotic. F = incoherent. KEYWORDS (searchability): A = property type + location cues + top features + lifestyle terms naturally. B = good features but missing property type or location. C = sparse keywords. D = weak terms. F = irrelevant. CTA (call to action): A = clear next step (schedule showing / request tour / contact agent). B = CTA present but weak. C = indirect CTA. D = vague. F = none. COMPLIANCE (Fair Housing + MLS): A = MLS-safe, factual, no discriminatory language, no errors. B = minor hype, still safe. C = multiple hype claims or steering-risk phrasing. D = major credibility issues. F = Fair Housing violation or discriminatory language. Fair Housing: Flag "perfect for families", "young professionals", "safe neighborhood", "ideal for students", "no Section 8", or protected class references. MLS: Avoid contact info, URLs, emojis, ALL CAPS spam. OUTPUT JSON: {"overall":"A|B|C|D|F","rewrite":"140-160 word MLS-ready rewrite with PRIMARY bedroom and clear CTA","categories":{"headline":{"grade":"A|B|C|D|F","feedback":"..."},"length":{"grade":"A|B|C|D|F","feedback":"..."},"emotion":{"grade":"A|B|C|D|F","feedback":"..."},"keywords":{"grade":"A|B|C|D|F","feedback":"..."},"cta":{"grade":"A|B|C|D|F","feedback":"..."},"compliance":{"grade":"A|B|C|D|F","feedback":"..."}},"recommendations":["...","...","..."]}. Be strict. Do not give A unless it truly meets A criteria. If missing key basics (beds/baths, property type, or extremely short), grades must drop.`,
          },
          {
            role: "user",
            content: `${locationBlock}LISTING:\n${listingText}`,
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

    // Enforce 140–160 word rewrite (retry up to 3 times)
    let rewrite = String(analysis.rewrite || "");
    rewrite = await ensureRewriteLength(rewrite, listingText, locationContext);
    const wc = countWords(rewrite);
    
    analysis.rewrite = rewrite;
    analysis.rewriteWordCount = wc;

    await submissionRef.update({
      status: "completed",
      analysis,
      completedAt: new Date().toISOString(),
      email,
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Run analysis error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
