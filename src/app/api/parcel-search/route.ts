import { NextRequest, NextResponse } from 'next/server';

const KEY = process.env.ATTOM_API_KEY || "";
const BASE = "https://api.developer.attomdata.com/propertyapi/v1.0.0";

if (!KEY) {
  console.error("[ATTOM] Missing ATTOM_API_KEY env var");
}

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
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { apikey: KEY, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const msg = `[ATTOM FAIL] ${res.status} ${path} — ${errText.slice(0, 200)}`;
      console.error(msg);
      await import("@/lib/logError").then(({ logError }) =>
        logError({ source: "parcel-search-attom", error: new Error(msg), context: { path, status: res.status } })
      ).catch(() => {});
      return null;
    }
    return res.json();
  } catch (e: any) {
    const msg = `[ATTOM ERROR] ${path} — ${e?.message || e}`;
    console.error(msg);
    await import("@/lib/logError").then(({ logError }) =>
      logError({ source: "parcel-search-attom", error: e, context: { path } })
    ).catch(() => {});
    return null;
  }
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const stateParam = (searchParams.get('state') || '').trim();
  const cityParam = (searchParams.get('city') || '').trim();

  if (!q || q.length < 5) return NextResponse.json({ results: [] });

  const addr1 = q;
  const addr2Parts: string[] = [];
  if (cityParam) addr2Parts.push(cityParam);
  if (stateParam) addr2Parts.push(stateParam);
  const addr2 = addr2Parts.join(', ') || '';

  const stateUpperRaw = stateParam.toUpperCase();
  const stateNormalized =
    stateUpperRaw.length === 2 ? stateUpperRaw : (STATE_MAP[stateUpperRaw] || stateUpperRaw.substring(0, 2));

  try {
    const r1 = await fetch(
      `${BASE}/property/address?address=${encodeURIComponent(addr1)}&city=${encodeURIComponent(cityParam)}&state=${encodeURIComponent(stateParam)}&zip=${encodeURIComponent(searchParams.get('zip') || '')}`,
      { headers: { apikey: KEY, Accept: 'application/json' }, cache: 'no-store' }
    );

    if (!r1.ok) {
      const errText = await r1.text().catch(() => '');
      const msg = `[ATTOM FAIL] ${r1.status} /property/address — ${errText.slice(0, 200)}`;
      console.error(msg);
      await import("@/lib/logError").then(({ logError }) =>
        logError({ source: "parcel-search-attom", error: new Error(msg), context: { path: "/property/address", status: r1.status } })
      ).catch(() => {});
      return NextResponse.json({ results: [] });
    }

    const d1 = await r1.json();
	return NextResponse.json({ debug_address_response: d1, status: r1.status });
    let matches: ParcelMatch[] = Array.isArray(d1?.property) ? (d1.property as ParcelMatch[]) : [];

    if (stateParam) {
      matches = matches.filter((m: ParcelMatch) => {
        const st = (m?.address?.countrySubd || '').toUpperCase();
        return st === stateNormalized;
      });
    }

    matches = matches.slice(0, 3);
    if (!matches.length) return NextResponse.json({ results: [] });

    const results: any[] = [];

    for (const m of matches) {
      const id = m?.identifier?.attomId || m?.identifier?.Id;
      if (!id) continue;

      const [d2, d3, avmData, saleHistData, assessHistData, permitData, mortgageData] = await Promise.all([
        fetchATTOM(`/property/expandedprofile?attomId=${id}`),
        fetchATTOM(`/property/detailwithschools?attomId=${id}`),
        fetchATTOM(`/attomavm/detail?attomId=${id}`),
        fetchATTOM(`/saleshistory/detail?attomId=${id}`),
        Promise.resolve(null), // assessment history not in current plan
        fetchATTOM(`/property/buildingpermits?attomId=${id}`),
        fetchATTOM(`/property/detailmortgage?attomId=${id}`),
      ]);

      const p = d2?.property?.[0];
      if (!p) continue;
      const s = d3?.property?.[0];

      const avmProp = avmData?.property?.[0];
      const avm = {
        value: String(avmProp?.avm?.amount?.value || ''),
        high: String(avmProp?.avm?.amount?.high || ''),
        low: String(avmProp?.avm?.amount?.low || ''),
        confidence: String(avmProp?.avm?.amount?.scr || ''),
        date: avmProp?.avm?.eventDate || '',
      };

      const saleHistory = (saleHistData?.property?.[0]?.saleHistory || saleHistData?.property || [])
        .map((sh: any) => ({
          date: sh?.sale?.saleTransDate || sh?.saleTransDate || '',
          price: String(sh?.sale?.amount?.saleAmt || sh?.amount?.saleAmt || ''),
          seller: sh?.sale?.sellerName || sh?.sellerName || '',
          buyer: sh?.sale?.buyerName || sh?.buyerName || '',
          type: sh?.sale?.amount?.saleTransType || sh?.amount?.saleTransType || '',
          docType: sh?.sale?.amount?.saleDocType || sh?.amount?.saleDocType || '',
        }))
        .filter((sh: any) => sh.date || sh.price);

      const assessHistory: any[] = [];
      const permits = (permitData?.property?.[0]?.buildingPermits || permitData?.property || [])
        .map((bp: any) => ({
          date: bp?.effectiveDate || bp?.issuedDate || '',
          type: bp?.type || bp?.permitType || '',
          description: bp?.description || bp?.workDescription || '',
          status: bp?.status || '',
          cost: String(bp?.jobValue || bp?.totalProjectValue || ''),
        }))
        .filter((bp: any) => bp.date || bp.type);

      const mtg = mortgageData?.property?.[0];
      const mortgage = {
        lender: mtg?.mortgage?.FirstConcurrent?.lenderLastName || mtg?.mortgage?.FirstConcurrent?.lenderName || '',
        amount: String(mtg?.mortgage?.FirstConcurrent?.amount || ''),
        rate: String(mtg?.mortgage?.FirstConcurrent?.interestRate || ''),
        type: mtg?.mortgage?.FirstConcurrent?.loanTypeCode || mtg?.mortgage?.FirstConcurrent?.loanType || '',
        term: String(mtg?.mortgage?.FirstConcurrent?.term || ''),
        dueDate: mtg?.mortgage?.FirstConcurrent?.dueDate || '',
        date: mtg?.mortgage?.FirstConcurrent?.date || '',
      };

      let floodZone = '';
      let floodSubtype = '';
      let floodSFHA = '';
      try {
        const lat = p?.location?.latitude;
        const lng = p?.location?.longitude;
        if (lat && lng) {
          const femaRes = await fetch(
            `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,ZONE_SUBTY,SFHA_TF&f=json&inSR=4326`
          );
          const femaData = await femaRes.json();
          const attrs = femaData?.features?.[0]?.attributes;
          if (attrs) {
            floodZone = attrs.FLD_ZONE || '';
            floodSubtype = attrs.ZONE_SUBTY || '';
            floodSFHA = attrs.SFHA_TF === 'T' ? 'Yes' : 'No';
          }
        }
      } catch {}

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
        story_desc: p?.building?.summary?.storyDesc || '',
        construction: p?.building?.construction?.constructionType || '',
        condition: p?.building?.construction?.condition || '',
        roof_cover: p?.building?.construction?.roofCover || '',
        roof_shape: p?.building?.construction?.roofShape || '',
        garage: p?.building?.parking?.garageType || '',
        garage_sqft: String(p?.building?.parking?.prkgSize || ''),
        pool: p?.lot?.poolType || (p?.lot?.poolInd === 'YES' ? 'Yes' : ''),
        subdivision: p?.area?.subdName || '',
        zoning: p?.lot?.zoningType || '',
        zoning_code: p?.lot?.siteZoningIdent || '',
        lot_num: p?.lot?.lotNum || '',
        land_sqft: String(p?.lot?.lotSize2 || ''),
        acres: String(p?.lot?.lotSize1 || ''),
        cooling: p?.utilities?.coolingType || '',
        heating_type: p?.utilities?.heatingType || '',
        heating_fuel: p?.utilities?.heatingFuel || '',
        latitude: p?.location?.latitude || '',
        longitude: p?.location?.longitude || '',
        fireplace: p?.building?.interior?.fplcInd === 'Y' ? `Yes (${p?.building?.interior?.fplcCount || 1})` : '',
        homestead: p?.assessment?.tax?.exemptiontype?.Homeowner === 'Y' ? 'Yes' : 'No',
        exemptions: Object.entries(p?.assessment?.tax?.exemptiontype || {})
          .filter(([_, v]) => v === 'Y')
          .map(([k]) => k)
          .join(', '),
        flood_zone: floodZone,
        flood_subtype: floodSubtype,
        flood_sfha: floodSFHA,
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
        owner2_name: p?.assessment?.owner?.owner2?.fullName || '',
        owner_type: p?.assessment?.owner?.description || '',
        absentee_owner: p?.assessment?.owner?.absenteeOwnerStatus === 'O' ? 'Owner Occupied' : 'Absentee',
        mailing_address: p?.assessment?.owner?.mailingAddressOneLine || '',
        title_company: p?.assessment?.mortgage?.title?.companyName || '',
        deed_type: p?.assessment?.mortgage?.FirstConcurrent?.deedType || '',
        sale_price: String(p?.sale?.amount?.saleAmt || ''),
        sale_trans_type: p?.sale?.amount?.saleTransType || '',
        sale_doc_type: p?.sale?.amount?.saleDocType || '',
        seller_name: p?.sale?.sellerName || '',
        sale_date: p?.sale?.saleTransDate || '',
        sale_year: String(p?.sale?.saleSearchDate ? new Date(p.sale.saleSearchDate).getFullYear() : ''),
        price_per_sqft: String(p?.sale?.calculation?.pricePerSizeUnit || ''),
        price_per_bed: String(p?.sale?.calculation?.pricePerBed || ''),
        last_modified: p?.vintage?.lastModified || '',
        dor_uc: (p?.area?.countyuse1 || p?.area?.countyUse1 || '').trim(),
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
    ).catch(() => {});
    return NextResponse.json({ results: [] });
  }
}
