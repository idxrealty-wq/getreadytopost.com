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

      /* Call 1: expandedprofile — all property + assessment data */
      const r2 = await fetch(
        `${BASE}/property/expandedprofile?attomid=${id}`,
        {
          headers: { apikey: KEY, Accept: 'application/json' },
          cache: 'no-store',
        }
      );
      const d2 = await r2.json();
      const p = d2?.property?.[0];
      if (!p) continue;

      /* Call 2: detailwithschools — school district + nearby schools */
      const r3 = await fetch(
        `${BASE}/property/detailwithschools?attomid=${id}`,
        {
          headers: { apikey: KEY, Accept: 'application/json' },
          cache: 'no-store',
        }
      );
      const d3 = await r3.json();
      const s = d3?.property?.[0];

      results.push({
        parcel_id: p?.identifier?.apn || '',
        address: p?.address?.line1 || '',
        city: p?.address?.locality || '',
        zip: p?.address?.postal1 || '',
        county: p?.area?.countrySecSubd || '',
        year_built: String(p?.summary?.yearBuilt || ''),
        sqft: String(p?.building?.size?.livingSize || ''),
        beds: String(p?.building?.rooms?.beds || ''),
        baths: String(p?.building?.rooms?.bathsTotal || ''),
        property_type: p?.summary?.propType || p?.summary?.propLandUse || '',
        legal_description: p?.summary?.legal1 || '',
        stories: String(p?.building?.summary?.levels || ''),
        construction: p?.building?.construction?.constructionType || '',
        garage: p?.building?.parking?.garageType || '',
        pool: p?.lot?.poolType || (p?.lot?.poolInd === 'YES' ? 'Yes' : ''),
        subdivision: p?.area?.subdName || '',
        zoning: p?.lot?.zoningType || '',
        land_sqft: String(p?.lot?.lotSize2 || ''),
        acres: String(p?.lot?.lotSize1 || ''),
        cooling: p?.utilities?.coolingType || '',
		latitude: p?.location?.latitude || '',
        longitude: p?.location?.longitude || '',
        fireplace: p?.building?.interior?.fplcInd === 'Y' ? `Yes (${p?.building?.interior?.fplcCount || 1})` : '',
        wall_type: p?.building?.construction?.wallType || '',
        improvements_year: p?.building?.construction?.propertyStructureMajorImprovementsYear || '',
        assessed_value: String(p?.assessment?.assessed?.assdTtlValue || ''),
        just_value: String(p?.assessment?.market?.mktTtlValue || ''),
        land_value: String(p?.assessment?.assessed?.assdLandValue || ''),
        building_value: String(p?.assessment?.assessed?.assdImprValue || ''),
        taxable_value: String(p?.assessment?.assessed?.assdTtlValue || ''),
        annual_tax: String(p?.assessment?.tax?.taxAmt || ''),
        tax_year: String(p?.assessment?.tax?.taxYear || ''),
        owner_name: p?.assessment?.owner?.owner1?.fullName || '',
        sale_price: String(p?.sale?.amount?.saleAmt || ''),
        sale_year: String(p?.sale?.salesSearchDate ? new Date(p.sale.salesSearchDate).getFullYear() : ''),
        last_modified: p?.vintage?.lastModified || '',
        dor_uc: p?.area?.countyuse1?.trim() || p?.area?.countyUse1?.trim() || '',

        /* School data from detailwithschools */
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
  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}
