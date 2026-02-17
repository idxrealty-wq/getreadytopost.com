import { NextResponse } from 'next/server';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

async function geocodeAddress(address: string) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_KEY}`
  );
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return data.results[0].geometry.location;
  }
  return null;
}

async function nearbySearch(lat: number, lng: number, type: string) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${GOOGLE_MAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.results || []).slice(0, 5).map((p: any) => ({
    name: p.name,
    vicinity: p.vicinity,
    rating: p.rating || null,
  }));
}

async function getDistances(originLat: number, originLng: number, places: any[]) {
  if (places.length === 0) return places;
  const destinations = places.map((p: any) => encodeURIComponent(p.vicinity)).join('|');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destinations}&units=imperial&key=${GOOGLE_MAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.rows && data.rows[0] && data.rows[0].elements) {
    data.rows[0].elements.forEach((el: any, i: number) => {
      if (el.status === 'OK' && places[i]) {
        places[i].distance = el.distance?.text || null;
        places[i].duration = el.duration?.text || null;
      }
    });
  }
  return places;
}

async function generateListing(address: string, propertyDetails: any, nearbyData: any) {
  const nearbyText = Object.entries(nearbyData)
    .map(([category, places]: [string, any]) => {
      const placeList = places
        .slice(0, 3)
        .map((p: any) => `${p.name}${p.distance ? ` (${p.distance})` : ''}${p.rating ? ` ${p.rating}★` : ''}`)
        .join(', ');
      return `${category}: ${placeList}`;
    })
    .join('\n');

  const prompt = `You are an elite MLS listing copywriter. Write a professional, buyer-focused listing description.

PROPERTY:
Address: ${address}
${propertyDetails.beds ? `Bedrooms: ${propertyDetails.beds}` : ''}
${propertyDetails.baths ? `Bathrooms: ${propertyDetails.baths}` : ''}
${propertyDetails.sqft ? `Square Feet: ${propertyDetails.sqft}` : ''}
${propertyDetails.price ? `Price: $${propertyDetails.price}` : ''}
${propertyDetails.features ? `Features: ${propertyDetails.features}` : ''}

NEARBY AMENITIES (mention 3-5 specific places BY NAME with distances):
${nearbyText}

RULES:
- 140-160 words, MLS-compliant, Fair Housing safe
- Mention specific nearby places BY NAME (e.g., "0.5 miles from Tavares Elementary")
- Use vivid, sensory language and buyer psychology
- Include a strong call to action
- SEO optimized for the area
- NO Fair Housing violations
- Professional, action-driven, urgency-creating

Write ONLY the listing description, nothing else.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Unable to generate listing.';
}

export async function POST(request: Request) {
  try {
    const { address, propertyDetails } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const location = await geocodeAddress(address);
    if (!location) {
      return NextResponse.json({ error: 'Could not find that address' }, { status: 400 });
    }

    const { lat, lng } = location;

    const [schools, restaurants, parks, shopping, hospitals, entertainment, transit, gas] = await Promise.all([
      nearbySearch(lat, lng, 'school'),
      nearbySearch(lat, lng, 'restaurant'),
      nearbySearch(lat, lng, 'park'),
      nearbySearch(lat, lng, 'supermarket'),
      nearbySearch(lat, lng, 'hospital'),
      nearbySearch(lat, lng, 'movie_theater'),
      nearbySearch(lat, lng, 'point_of_interest', 'golf course'),
      nearbySearch(lat, lng, 'gas_station'),
    ]);

    const [schoolsD, restaurantsD, parksD, shoppingD, hospitalsD, entertainmentD, transitD, gasD] = await Promise.all([
      getDistances(lat, lng, schools),
      getDistances(lat, lng, restaurants),
      getDistances(lat, lng, parks),
      getDistances(lat, lng, shopping),
      getDistances(lat, lng, hospitals),
      getDistances(lat, lng, entertainment),
      getDistances(lat, lng, transit),
      getDistances(lat, lng, gas),
    ]);

    const nearbyData = {
      Schools: schoolsD,
      Restaurants: restaurantsD,
      Parks: parksD,
      Shopping: shoppingD,
      Medical: hospitalsD,
      Entertainment: entertainmentD,
      Golf: transitD,
      Gas: gasD,
    };

    const listing = await generateListing(address, propertyDetails || {}, nearbyData);

    return NextResponse.json({
      address,
      lat,
      lng,
      nearby: nearbyData,
      listing,
    });
  } catch (error) {
    console.error('Workspace error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
