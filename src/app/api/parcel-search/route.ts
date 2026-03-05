import { NextRequest, NextResponse } from 'next/server';

const KEY = '343bc00b6e80a125e9a2ad10a53aabd1';
const BASE = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

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

  try {
    const r1 = await fetch(
      `${BASE}/property/address?address1=${encodeURIComponent(addr1)}&address2=${encodeURIComponent(addr2)}`,
      {
        headers: { apikey: KEY, Accept: 'application/json' },
        cache: 'no-store',
      }
    );
    const d1 = await r1.json();
    let matches = Array.isArray(d1?.property) ? d1.property : [];

    if (stateParam) {
      const stateUpper = stateParam.toUpperCase();
      matches = matches.filter((m) => {
        const st = (m?.address?.countrySubd || '').toUpperCase();
        return st === stateUpper || st === stateUpper.substring(0, 2);
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
        just_value: '',
        sale_price: '',
        sale_year: '',
        dor_uc: '',
        land_sqft: String(p?.lot?.lotsize2 || ''),
        legal_description: '',
        owner_name: '',
        homestead: '',
        search_key: q.toLowerCase(),
      });
    }

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}
