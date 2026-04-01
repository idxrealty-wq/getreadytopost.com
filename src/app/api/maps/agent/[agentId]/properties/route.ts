// src/app/api/maps/agent/[agentId]/properties/route.ts

import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

function parseNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseStatus(status: string): "active" | "sold" | "pending" {
  const s = (status || "").toLowerCase();
  if (s === "sold") return "sold";
  if (s === "pending") return "pending";
  return "active";
}

function getPrimaryPhoto(photos: Record<string, unknown>[]): string {
  if (!photos || photos.length === 0) return "";
  const primary = photos.find((p) => p.isPrimary);
  if (primary?.downloadURL) return primary.downloadURL as string;
  const first = photos.find((p) => p.downloadURL);
  return first ? (first.downloadURL as string) : "";
}

function cleanVideoUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return trimmed;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;

  if (!agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  try {
    const q = query(
      collection(db, "listings"),
      where("userId", "==", agentId)
    );

    const snapshot = await getDocs(q);
    const pins: Record<string, unknown>[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const pd = data.propertyData || {};
      const photos = data.photos || [];

      const lat = parseNum(pd.latitude);
      const lng = parseNum(pd.longitude);

      if (!lat || !lng) return;

      pins.push({
        id: data.id || doc.id,
        mlsNumber: pd.parcelId || pd.taxId || doc.id.slice(-8).toUpperCase(),
        address: pd.address || data.address || "",
        city: pd.city || "",
        state: pd.state || "FL",
        zip: pd.zip || "",
        lat,
        lng,
        status: parseStatus(data.listingStatus || data.status || "active"),
        listPrice: parseNum(pd.price) || parseNum(data.price) || 0,
        bedrooms: parseNum(pd.beds),
        bathrooms: parseNum(pd.baths),
        sqft: parseNum(pd.sqft),
        listedDate: pd.dateAdded || data.createdAt?.slice(0, 10) || "",
        photoUrl: getPrimaryPhoto(photos),
        videoUrl: cleanVideoUrl(pd.virtualTourUrl || ""),
        description: data.notes || pd.features?.slice(0, 200) || "",
      });
    });

    return NextResponse.json({ properties: pins });
  } catch (err) {
    console.error("Agent properties API error:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
