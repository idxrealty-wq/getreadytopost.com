import { NextRequest, NextResponse } from 'next/server';

const ATTOM_API_KEY = 'a82acb1b1062891301dcab519babbb68';
const ATTOM_BASE_URL = 'https://api.attomdata.com/propertyapi/v1.0.0';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Parse address components
    const parts = q.split(',').map(p => p.trim());
    const address1 = parts[0];
    const address2 = parts.length > 1 ? parts.slice(1).join(', ') : 'Florida';

    // Call ATTOM API
    const attomUrl = new URL(`${ATTOM_BASE_URL}/property/address`);
    attomUrl.searchParams.append('address1', address1);
    attomUrl.searchParams.append('address2', address2);
    attomUrl.searchParams.append('apikey', ATTOM_API_KEY);

    const response = await fetch(attomUrl.toString());
    const data = await response.json();

    if (!data.property || data.property.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Map ATTOM response to our format
    const results = data.property.map((prop: any) => ({
      parcel_id: prop.parcelNumber || '',
      address: prop.address?.streetAddress || '',
      city: prop.address?.city || '',
      zip: prop.address?.postalCode || '',
      county: 'Orange',
      year_built: prop.building?.yearBuilt?.toString() || '',
      sqft: prop.building?.livingArea?.toString() || '',
      beds: prop.building?.bedrooms?.toString() || '',
      baths: prop.building?.bathrooms?.toString() || '',
      just_value: prop.assessment?.assessedValue?.toString() || '',
      sale_price: prop.sale?.salePrice?.toString() || '',
      sale_year: prop.sale?.saleTransDate ? new Date(prop.sale.saleTransDate).getFullYear().toString() : '',
      dor_uc: '',
      land_sqft: prop.lot?.lotSize?.toString() || '',
      legal_description: prop.lot?.legalDescription || '',
      owner_name: prop.owner?.ownerOccupied ? 'Owner Occupied' : '',
      homestead: '',
      search_key: q.toLowerCase(),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[parcel-search] error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
