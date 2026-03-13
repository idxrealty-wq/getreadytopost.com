import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.ATTOM_API_KEY || "";
const BASE = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

function getBearerToken(req: NextRequest): string {
  const h = req.headers.get("authorization") || "";
  if (!h.toLowerCase().startsWith("bearer ")) return "";
  return h.slice(7);
}

type ParcelMatch = {
  address?: { countrySubd?: string | null } | null;
  identifier?: { attomId?: number | string | null; Id?: number | string | null } | null;
};

const STATE_MAP: Record<string, string> = {
  ALABAMA: "AL", ALASKA: "AK", ARIZONA: "AZ", ARKANSAS: "AR", CALIFORNIA: "CA",
  COLORADO: "CO", CONNECTICUT: "CT", DELAWARE: "DE", FLORIDA: "FL", GEORGIA: "GA",
  HAWAII: "HI", IDAHO: "ID", ILLINOIS: "IL", INDIANA: "IN", IOWA: "IA",
  KANSAS: "KS", KENTUCKY: "KY", LOUISIANA: "LA", MAINE: "ME", MARYLAND: "MD",
  MASSACHUSETTS: "MA", MICHIGAN: "MI", MINNESOTA: "MN", MISSISSIPPI: "MS", MISSOURI: "MO",
  MONTANA: "MT", NEBRASKA: "NE", NEVADA: "NV", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ",
  "NEW MEXICO": "NM", "NEW YORK": "NY", "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND",
  OHIO: "OH", OKLAHOMA: "OK", OREGON: "OR", PENNSYLVANIA: "PA", "RHODE ISLAND": "RI",
  "SOUTH CAROLINA": "SC", "SOUTH DAKOTA": "SD", TENNESSEE: "TN", TEXAS: "TX", UTAH: "UT",
  VERMONT: "VT", VIRGINIA: "VA", WASHINGTON: "WA", "WEST VIRGINIA": "WV", WISCONSIN: "WI",
  WYOMING: "WY", "DISTRICT OF COLUMBIA": "DC", "WASHINGTON DC": "DC", "WASHINGTON D.C.": "DC",
};

async function fetchATTOM(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { apikey: KEY, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function requireAuthAndDeductCredit(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { getAuth } = await import("firebase-admin/auth");
  let uid = "";
  try {
    const decoded = await getAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const db = getAdminDb();
  const balRef = db.collection("users").doc(uid).collection("credits").doc("balance");

  const balSnap = await balRef.get();
  const balance = balSnap.exists ? Number(balSnap.data()?.balance ?? 0) : 0;

  const COST_PER_SEARCH = 1;
  if (balance < COST_PER_SEARCH) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `Insufficient credits (${balance}). Please buy more credits.` },
        { status: 402 }
      ),
    };
  }

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(balRef);
    const current = snap.exists ? Number(snap.data()?.balance ?? 0) : 0;
    if (current < COST_PER_SEARCH) throw new Error("INSUFFICIENT_CREDITS");

    tx.set(balRef, { balance: FieldValue.increment(-COST_PER_SEARCH) }, { merge: true });

    const tRef = db.collection("users").doc(uid).collection("transactions").doc();
    tx.set(tRef, {
      type: "deduct",
      packageType: "search",
      creditsAdded: -COST_PER_SEARCH,
      revenue: 0,
      source: "parcel-search",
      timestamp: FieldValue.serverTimestamp(),
    });
  });

  return { ok: true as const, uid };
}
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthAndDeductCredit(req);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const stateParam = (searchParams.get("state") || "").trim();
    const cityParam = (searchParams.get("city") || "").trim();

    if (!q || q.length < 5) return NextResponse.json({ results: [] });

    const addr1 = q;
    const addr2Parts: string[] = [];
    if (cityParam) addr2Parts.push(cityParam);
    if (stateParam) addr2Parts.push(stateParam);
    const addr2 = addr2Parts.join(", ") || "";

    const stateUpperRaw = stateParam.toUpperCase();
    const stateNormalized =
      stateUpperRaw.length === 2 ? stateUpperRaw : (STATE_MAP[stateUpperRaw] || stateUpperRaw.substring(0, 2));

    const d1 = await fetchATTOM(
      `/property/address?address1=${encodeURIComponent(addr1)}&address2=${encodeURIComponent(addr2)}`
    );

    let matches: ParcelMatch[] = Array.isArray(d1?.property) ? (d1.property as ParcelMatch[]) : [];

    if (stateParam) {
      matches = matches.filter((m: ParcelMatch) => {
        const st = String(m?.address?.countrySubd || "").toUpperCase();
        return st === stateNormalized;
      });
    }

    matches = matches.slice(0, 3);
    if (!matches.length) return NextResponse.json({ results: [] });

    const results: any[] = [];

    for (const m of matches) {
      const id = m?.identifier?.attomId || m?.identifier?.Id;
      if (!id) continue;

      const [d2, d3] = await Promise.all([
        fetchATTOM(`/property/expandedprofile?attomid=${id}`),
        fetchATTOM(`/property/detailwithschools?attomid=${id}`),
      ]);

      const p = d2?.property?.[0];
      if (!p) continue;

      const s = d3?.property?.[0];

      results.push({
        parcel_id: p?.identifier?.apn || "",
        address: p?.address?.line1 || "",
        city: p?.address?.locality || "",
        zip: p?.address?.postal1 || "",
        county: p?.area?.countrySecSubd || "",
        latitude: p?.location?.latitude || "",
        longitude: p?.location?.longitude || "",
        year_built: String(p?.summary?.yearBuilt || ""),
        sqft: String(p?.building?.size?.livingSize || ""),
        beds: String(p?.building?.rooms?.beds || ""),
        baths: String(p?.building?.rooms?.bathsTotal || ""),
        property_type: p?.summary?.propType || p?.summary?.propLandUse || "",
        school_district: s?.schoolDistrict?.districtname || "",
        schools: (s?.school || []).map((sc: any) => ({
          name: sc?.InstitutionName || "",
          rating: sc?.schoolRating || "",
          grades: `${sc?.gradelevel1lotext || ""}-${sc?.gradelevel1hitext || ""}`,
          type: sc?.Filetypetext || "",
          distance: sc?.distance || 0,
          lat: sc?.geocodinglatitude || "",
          lng: sc?.geocodinglongitude || "",
        })),
        search_key: q.toLowerCase(),
      });
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    await import("@/lib/logError").then(({ logError }) =>
      logError({ source: "parcel-search", error: e, context: {} })
    );
    return NextResponse.json({ results: [] });
  }
}
