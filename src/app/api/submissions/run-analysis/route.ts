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
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
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
    if (wc >= 140 && wc <= 160) return current;

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
              "You are an elite MLS listing copywriter. You MUST follow the facts. Do NOT invent beds, baths, square footage, upgrades, HOA, views, waterfront, or any features not explicitly provided. If facts are missing, use neutral phrasing (e.g., 'spacious layout') without adding numbers. Rewrite to exactly 150 words. MLS-safe, Fair Housing safe. Return ONLY the rewritten text.",
          },
          {
            role: "user",
            content: `FACTS (only use these; do not add new facts):\n${factsBlock}\n\nRewrite this to exactly 150 words:\n\n${current}`,
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
