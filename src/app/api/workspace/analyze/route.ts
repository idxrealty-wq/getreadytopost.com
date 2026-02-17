import { NextResponse } from 'next/server';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

async function geocodeAddress(address) {
  const res = await fetch(
    'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&key=' + GOOGLE_MAPS_KEY
  );
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return data.results[0].geometry.location;
  }
  return null;
}

async function nearbySearch(lat, lng, keyword) {
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lng + '&radius=5000&keyword=' + encodeURIComponent(keyword) + '&key=' + GOOGLE_MAPS_KEY;
  const res = await fetch(url);
  const data = await res.json();
  return (data.results || []).slice(0, 5).map((p) => ({
    name: p.name,
    vicinity: p.vicinity,
    rating: p.rating || null,
  }));
}

async function getDistances(originLat, originLng, places) {
  if (places.length === 0) return places;
  const destinations = places.map((p) => encodeURIComponent(p.vicinity)).join('|');
  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + originLat + ',' + originLng + '&destinations=' + destinations + '&units=imperial&key=' + GOOGLE_MAPS_KEY;
  const res = await fetch(url);
  const data = await res.json();
  if (data.rows && data.rows[0] && data.rows[0].elements) {
    data.rows[0].elements.forEach((el, i) => {
      if (el.status === 'OK' && places[i]) {
        places[i].distance = el.distance?.text || null;
        places[i].duration = el.duration?.text || null;
      }
    });
  }
  return places;
}

async function generateListing(address, propertyDetails, nearbyData) {
  const nearbyText = Object.entries(nearbyData)
    .map(([category, places]) => {
      const placeNames = places.slice(0, 3).map((p) => p.name).join(', ');
      return category + ': ' + placeNames;
    })
    .join('
');

  const prompt = 'You are an elite MLS listing copywriter. Write a professional, buyer-focused listing description.

PROPERTY:
Address: ' + address + '
' + (propertyDetails.beds ? 'Bedrooms: ' + propertyDetails.beds + '
' : '') + (propertyDetails.baths ? 'Bathrooms: ' + propertyDetails.baths + '
' : '') + (propertyDetails.sqft ? 'Square Feet: ' + propertyDetails.sqft + '
' : '') + (propertyDetails.price ? 'Price: $' + propertyDetails.price + '
' : '') + (propertyDetails.yearBuilt ? 'Year Built: ' + propertyDetails.yearBuilt + '
' : '') + (propertyDetails.lotSize ? 'Lot Size: ' + propertyDetails.lotSize + '
' : '') + (propertyDetails.features ? 'Features: ' + propertyDetails.features + '
' : '') + '

NEARBY AMENITIES:
' + nearbyText + '

RULES:
- 140-160 words, MLS-compliant, Fair Housing safe
- Mention specific nearby places BY NAME
- Use vivid sensory language and buyer psychology
- Include a strong call to action
- SEO optimized for the area
- NO Fair Housing violations
- Professional action-driven urgency-creating

Write ONLY the listing description nothing else.';

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + OPENAI_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

      return 'AI listing generation is temporarily unavailable.';
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Unable to generate listing.';
  } catch (error) {
    return 'AI listing generation is temporarily unavailable.';
  }
}

export async function POST(request) {
  try {
    const { address, propertyDetails } = await request.json();

      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const location = await geocodeAddress(address);
      return NextResponse.json({ error: 'Could not find that address' }, { status: 400 });
    }

    const { lat, lng } = location;

    const [schools, restaurants, parks, grocery, hospitals, entertainment, golf, gas, utilities, shopping] = await Promise.all([
      nearbySearch(lat, lng, 'school'),
      nearbySearch(lat, lng, 'restaurant'),
      nearbySearch(lat, lng, 'park'),
      nearbySearch(lat, lng, 'grocery store'),
      nearbySearch(lat, lng, 'hospital'),
      nearbySearch(lat, lng, 'entertainment'),
      nearbySearch(lat, lng, 'golf course'),
      nearbySearch(lat, lng, 'gas station'),
      nearbySearch(lat, lng, 'utility company'),
      nearbySearch(lat, lng, 'shopping mall'),
    ]);

    const [schoolsD, restaurantsD, parksD, groceryD, hospitalsD, entertainmentD, golfD, gasD, utilitiesD, shoppingD] = await Promise.all([
      getDistances(lat, lng, schools),
      getDistances(lat, lng, restaurants),
      getDistances(lat, lng, parks),
      getDistances(lat, lng, grocery),
      getDistances(lat, lng, hospitals),
      getDistances(lat, lng, entertainment),
      getDistances(lat, lng, golf),
      getDistances(lat, lng, gas),
      getDistances(lat, lng, utilities),
      getDistances(lat, lng, shopping),
    ]);

    const nearbyData = {
      Schools: schoolsD,
      Restaurants: restaurantsD,
      Parks: parksD,
      Grocery: groceryD,
      Medical: hospitalsD,
      Entertainment: entertainmentD,
      Golf: golfD,
      Gas: gasD,
      Utilities: utilitiesD,
      Shopping: shoppingD,
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
