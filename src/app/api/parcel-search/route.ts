import { NextRequest, NextResponse } from 'next/server';

const ATTOM_API_KEY = '343bc00b6e80a125e9a2ad10a53aabd1';
const ATTOM_BASE = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q || q.length < 3) return NextResponse.json({ results: [] });

  try {
    const parts = q.split(',').map(p => p.trim()).filter(Boolean);
    const address1 = parts[0] || '';
    const address2 = parts.slice(1).join(', ') || 'FL';

    const url = `${ATTOM_BASE}/property/address?address1=${encodeURIComponent(address1)}&address2=${encodeURIComponent(address2)}`;

    const res = await fetch(url, {
      headers: {
        apikey: ATTOM_API_KEY,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!data.property || data.property.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = data.property.map((prop: any) => ({
      parcel_id: prop.identifier?.apn || '',
      address: prop.address?.line1 || '',
      city: prop.address?.locality || '',
      zip: prop.address?.postal1 || '',
      county: 'Orange',
      year_built: String(prop.summary?.yearbuilt || ''),
      sqft: String(prop.building?.size?.livingsize || ''),
      beds: String(prop.building?.rooms?.beds || ''),
      baths: String(prop.building?.rooms?.bathstotal || ''),
      just_value: '',
      sale_price: '',
      sale_year: '',
      dor_uc: '',
      land_sqft: String(prop.lot?.lotsize2 || ''),
      legal_description: String(prop.summary?.legal1 || ''),
      owner_name: '',
      homestead: '',
      search_key: q.toLowerCase(),
    }));

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ results: [], error: e?.message }, { status: 200 });
  }
}
