import { NextRequest, NextResponse } from 'next/server';

const KEY = '343bc00b6e80a125e9a2ad10a53aabd1';
const BASE = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

type ParcelMatch = {
  address?: {
    countrySubd?: string | null;
  } | null;
  identifier?: {
    attomId?: number | string | null;
    Id?: number | string | null;
  } | null;
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
  WYOMING: 'WY',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const stateParam = (searchParams.get('state') || '').trim();
  const cityParam = (searchParams.get('city') || '').trim();

  if (!q || q.length < 5) return NextResponse.json({ results: [] });

  const addr1 = q;
  const addr2Parts = [];
  if (cityParam) addr2Parts.push(cityParam);
  if (stateParam) addr2Parts.push(stateParam);
  const addr2 = addr2Parts.join(', ') || '';

  const stateUpperRaw = stateParam.toUpperCase();
  const stateNormalized =
    stateUpperRaw.length === 2 ? stateUpperRaw : (STATE_MAP[stateUpperRaw] || stateUpperRaw.substring(0, 2));

  try {
    const r1 = await fetch(
      `${BASE}/property/address?address1=${encodeURIComponent(addr1)}&address2=${encodeURIComponent(addr2)}`,
      {
        headers: { apikey: KEY, Accept: 'application/json' },
        cache: 'no-store',
      }
    );

    const d1 = await r1.json();
    let matches: ParcelMatch[] = Array.isArray(d1?.property) ? (d1.property as ParcelMatch[]) : [];

    if (stateParam) {
      matches = matches.filter((m: ParcelMatch) => {
        const st = (m?.address?.countrySubd || '').toUpperCase();
        return st === stateNormalized;
      });
    }

    matches = matches.slice(0, 3);
    if (!matches.length) return NextResponse.json({ results: [] });

    const results = [];

    for (const m of matches) {
      const id = m?.identifier?.attomId || m?.identifier?.Id;
      if (!id) continue;

      const r2 = await fetch(`${BASE}/property/detail?attomid=${id}`, {
        headers: { apikey: KEY, Accept: 'application/json' },
        cache: 'no-store',
      });

      const d2 = await r2.json();
      const p = d2?.property?.[0];
      if (!p) continue;
      results.push({
        parcel_id: p?.identifier?.apn || '',
        address: p?.address?.line1 || '',
        city: p?.address?.locality || '',
        zip: p?.address?.postal1 || '',
        county: p?.address?.countrySubd || '',
        year_built: String(p?.summary?.yearbuilt || ''),
        sqft: String(p?.building?.size?.livingsize || ''),
        beds: String(p?.building?.rooms?.beds || ''),
        baths: String(p?.building?.rooms?.bathstotal || ''),
        just_value: String(p?.assessment?.market?.mktttlvalue || ''),
        assessed_value: String(p?.assessment?.assessed?.assdttlvalue || ''),
        taxable_value: String(p?.assessment?.tax?.taxamt || ''),
        land_value: String(p?.assessment?.market?.mktlandvalue || ''),
        building_value: String(p?.assessment?.market?.mktimprvalue || ''),
        sale_price: String(p?.sale?.amount?.saleamt || ''),
        sale_year: String(p?.sale?.salesearchdate ? new Date(p.sale.salesearchdate).getFullYear() : ''),
        property_type: p?.summary?.proptype || '',
        legal_description: p?.summary?.legal1 || '',
        owner_name: p?.owner?.owner1?.fullname || '',
        homestead: p?.assessment?.tax?.taxexemption1 ? 'Yes' : 'No',
        stories: String(p?.building?.summary?.levels || ''),
        land_sqft: String(p?.lot?.lotsize2 || ''),
        acres: String(p?.lot?.lotsize1 || ''),
        dor_uc: '',
        search_key: q.toLowerCase(),
      });
    }

    return NextResponse.json({ results });

  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}
