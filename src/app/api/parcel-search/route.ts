import { NextRequest, NextResponse } from 'next/server';
const KEY = process.env.ATTOM_API_KEY || "";
const BASE = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

type ParcelMatch = {
  address?: { countrySubd?: string | null; } | null;
  identifier?: { attomId?: number | string | null; Id?: number | string | null; } | null;
};

const STATE_MAP: Record<string, string> = {
  ALABAMA: 'AL', ALASKA: 'AK', ARIZONA: 'AZ', ARKANSAS: 'AR', CALIFORNIA: 'CA',
  COLORADO: 'CO', CONNECTICUT: 'CT', DELAWARE: 'DE', FLORIDA: 'FL', GEORGIA: 'GA',
  HAWAII: 'HI', IDAHO: 'ID', ILLINOIS: 'IL', INDIANA: 'IN', IOWA: 'IA',
  KANSAS: 'KS', KENTUCKY: 'KY', LOUISIANA: 'LA', MAINE: 'ME', MARYLAND: 'MD',
  MASSACHUSETTS: 'MA', MICHIGAN: 'MI', MINNESOTA: 'MN', MISSISSIPPI: 'MS', MISSOURI: 'MO',
  MONTANA: 'MT', NEBRASKA: 'NE', NEVADA: 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ',
  'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND',
  OHIO: 'OH', OKLAHOMA: 'OK', OREGON: 'OR', PENNSYLVANIA: 'PA', 'RHODE ISLAND': 'RI',
  'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD', TENNESSEE: 'TN', TEXAS: 'TX', UTAH: 'UT',
  VERMONT: 'VT', VIRGINIA: 'VA', WASHINGTON: 'WA', 'WEST VIRGINIA': 'WV', WISCONSIN: 'WI',
  WYOMING: 'WY', 'DISTRICT OF COLUMBIA': 'DC', 'WASHINGTON DC': 'DC', 'WASHINGTON D.C.': 'DC',
};

async function fetchATTOM(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { apikey: KEY, Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const stateParam = (searchParams.get('state') || '').trim();
  const cityParam = (searchParams.get('city') || '').trim();
  const debug = searchParams.get('debug') === 'true';

  if (!q || q.length < 5) return NextResponse.json({ results: [] });

  const stateUpperRaw = stateParam ? stateParam.toUpperCase() : '';
  const stateNormalized = stateUpperRaw.length === 2 ? stateUpperRaw : (STATE_MAP[stateUpperRaw] || stateUpperRaw.substring(0, 2));
  const addr2Parts = [];
  if (cityParam) addr2Parts.push(cityParam);
  if (stateNormalized) addr2Parts.push(stateNormalized);
  const addr2 = addr2Parts.join(', ') || '';

  const attomUrl = `${BASE}/property/address?address1=${encodeURIComponent(q)}&address2=${encodeURIComponent(addr2)}`;

  try {
    const r1 = await fetch(attomUrl, {
      headers: { apikey: KEY, Accept: 'application/json' },
      cache: 'no-store',
    });
    const d1 = await r1.json();

    if (debug) {
      return NextResponse.json({
        debug: {
          attomUrl,
          address1: q,
          address2: addr2,
          stateNormalized,
          keyPresent: KEY.length > 0,
          httpStatus: r1.status,
          attomRawResponse: d1,
        }
      });
    }

    let matches: ParcelMatch[] = Array.isArray(d1?.property) ? (d1.property as ParcelMatch[]) : [];
    if (stateParam) {
      matches = matches.filter((m: ParcelMatch) => {
        const st = (m?.address?.countrySubd || '').toUpperCase();
        return st === stateNormalized;
      });
    }
    matches = matches.slice(0, 3);
    if (!matches.length) return NextResponse.json({ results: [] });
        dor_uc: p?.area?.countyuse1?.trim() || p?.area?.countyUse1?.trim() || '',
        avm_value: avm.value,
        avm_high: avm.high,
        avm_low: avm.low,
        avm_confidence: avm.confidence,
        avm_date: avm.date,
        mortgage_lender: mortgage.lender,
        mortgage_amount: mortgage.amount,
        mortgage_rate: mortgage.rate,
        mortgage_type: mortgage.type,
        mortgage_term: mortgage.term,
        mortgage_due_date: mortgage.dueDate,
        mortgage_date: mortgage.date,
        sale_history: saleHistory,
        assessment_history: assessHistory,
        building_permits: permits,
        school_district: s?.schoolDistrict?.districtname || '',
        school_district_type: s?.schoolDistrict?.districttype || '',
        school_district_lat: s?.schoolDistrict?.districtlatitude || '',
        school_district_lng: s?.schoolDistrict?.districtlongitude || '',
        schools: (s?.school || []).map((sc: any) => ({
          name: sc?.InstitutionName || '',
          rating: sc?.schoolRating || '',
          grades: `${sc?.gradelevel1lotext || ''}-${sc?.gradelevel1hitext || ''}`,
          type: sc?.Filetypetext || '',
          distance: sc?.distance || 0,
          lat: sc?.geocodinglatitude || '',
          lng: sc?.geocodinglongitude || '',
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
