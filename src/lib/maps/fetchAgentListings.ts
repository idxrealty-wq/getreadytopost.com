// src/lib/maps/fetchAgentListings.ts

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PropertyPin } from "./mapTypes";

function parseNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.\-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseStatus(status: string): "active" | "sold" | "pending" | "poi" {
  const s = (status || "").toLowerCase();
  if (s === "sold") return "sold";
  if (s === "pending") return "pending";
  if (s === "poi") return "poi";
  return "active";
}

function getPrimaryPhoto(photos: Record<string, unknown>[]): string {
  if (!photos || photos.length === 0) return "";
  // Prefer isPrimary photo first
  const primary = photos.find((p) => p.isPrimary);
  if (primary?.downloadURL) return primary.downloadURL as string;
  // Fall back to first photo with a downloadURL
  const first = photos.find((p) => p.downloadURL);
  return first ? (first.downloadURL as string) : "";
}

function cleanVideoUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  // Convert youtube.com/watch?v=ID to embed format for modal
  const match = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return trimmed;
}

export async function fetchAgentListings(userId: string): Promise<PropertyPin[]> {
  try {
    const q = query(
      collection(db, "listings"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const pins: PropertyPin[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const pd = data.propertyData || {};
      const photos = data.photos || [];

      const lat = parseNum(pd.latitude);
      const lngRaw = parseNum(pd.longitude);
      const lng = lngRaw > 0 ? -lngRaw : lngRaw;

      // Skip listings with no coordinates
      if (!lat || !lng) return;

      const pin: PropertyPin = {
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
      };

      pins.push(pin);
    });

    return pins;
  } catch (err) {
    console.error("fetchAgentListings error:", err);
    return [];
  }
}
