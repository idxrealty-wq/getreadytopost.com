// @ts-nocheck
import { NextResponse } from 'next/server';

var GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
var OPENAI_KEY = process.env.OPENAI_API_KEY || '';

async function geocodeAddress(address) {
  var res = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&key=' + GOOGLE_MAPS_KEY);
  var data = await res.json();
  if (data.results && data.results.length > 0) { return data.results[0].geometry.location; }
  return null;
}

async function nearbySearch(lat, lng, keyword) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lng + '&radius=5000&keyword=' + encodeURIComponent(keyword) + '&key=' + GOOGLE_MAPS_KEY;
  var res = await fetch(url);
  var data = await res.json();
  return (data.results || []).slice(0, 5).map(function(p) { return { name: p.name, vicinity: p.vicinity, rating: p.rating || null }; });
}

async function getDistances(originLat, originLng, places) {
  if (places.length === 0) return places;
  var destinations = places.map(function(p) { return encodeURIComponent(p.vicinity); }).join('|');
  var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + originLat + ',' + originLng + '&destinations=' + destinations + '&units=imperial&key=' + GOOGLE_MAPS_KEY;
  var res = await fetch(url);
  var data = await res.json();
  if (data.rows && data.rows[0] && data.rows[0].elements) {
    data.rows[0].elements.forEach(function(el, i) {
      if (el.status === 'OK' && places[i]) {
        places[i].distance = el.distance ? el.distance.text : null;
        places[i].duration = el.duration ? el.duration.text : null;
      }
    });
  }
  return places;
}

async function generateListing(address, propertyDetails, nearbyData) {
  var nearbyLines = [];
  var entries = Object.entries(nearbyData);
  for (var i = 0; i < entries.length; i++) {
    var category = entries[i][0];
    var places = entries[i][1];
    var names = places.slice(0, 3).map(function(p) { return p.name; }).join(', ');
    nearbyLines.push(category + ': ' + names);
  }
  var nearbyText = nearbyLines.join(String.fromCharCode(10));
  var nl = String.fromCharCode(10);
  var prompt = 'You are an elite MLS listing copywriter. Write a professional buyer-focused listing description.' + nl + nl + 'PROPERTY:' + nl + 'Address: ' + address + nl;
  if (propertyDetails.beds) prompt += 'Bedrooms: ' + propertyDetails.beds + nl;
  if (propertyDetails.baths) prompt += 'Bathrooms: ' + propertyDetails.baths + nl;
  if (propertyDetails.sqft) prompt += 'Square Feet: ' + propertyDetails.sqft + nl;
  if (propertyDetails.price) prompt += 'Price: ' + propertyDetails.price + nl;
  if (propertyDetails.yearBuilt) prompt += 'Year Built: ' + propertyDetails.yearBuilt + nl;
  if (propertyDetails.lotSize) prompt += 'Lot Size: ' + propertyDetails.lotSize + nl;
  if (propertyDetails.features) prompt += 'Features: ' + propertyDetails.features + nl;
  prompt += nl + 'NEARBY AMENITIES:' + nl + nearbyText + nl + nl;
  prompt += 'RULES: 140-160 words MLS-compliant Fair Housing safe. Mention specific nearby places BY NAME. Vivid sensory language buyer psychology. Strong call to action. SEO optimized. Write ONLY the listing description.';
  try {
    var res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
      body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 500 })
    });
    if (res.ok === false) { return 'AI listing generation is temporarily unavailable.'; }
    var data = await res.json();
    return data.choices[0].message.content || 'Unable to generate listing.';
  } catch (error) { return 'AI listing generation is temporarily unavailable.'; }
}

export async function POST(request) {
  try {
    var body = await request.json();
    var address = body.address;
    var propertyDetails = body.propertyDetails || {};
    if (address === undefined || address === '') { return NextResponse.json({ error: 'Address is required' }, { status: 400 }); }
    var location = await geocodeAddress(address);
    if (location === null) { return NextResponse.json({ error: 'Could not find that address' }, { status: 400 }); }
    var lat = location.lat;
    var lng = location.lng;
    var results = await Promise.all([
      nearbySearch(lat, lng, 'school'),
      nearbySearch(lat, lng, 'restaurant'),
      nearbySearch(lat, lng, 'park'),
      nearbySearch(lat, lng, 'grocery store'),
      nearbySearch(lat, lng, 'hospital'),
      nearbySearch(lat, lng, 'entertainment'),
      nearbySearch(lat, lng, 'golf course'),
      nearbySearch(lat, lng, 'gas station'),
      nearbySearch(lat, lng, 'utility company'),
      nearbySearch(lat, lng, 'shopping mall')
    ]);
    var distResults = await Promise.all([
      getDistances(lat, lng, results[0]),
      getDistances(lat, lng, results[1]),
      getDistances(lat, lng, results[2]),
      getDistances(lat, lng, results[3]),
      getDistances(lat, lng, results[4]),
      getDistances(lat, lng, results[5]),
      getDistances(lat, lng, results[6]),
      getDistances(lat, lng, results[7]),
      getDistances(lat, lng, results[8]),
      getDistances(lat, lng, results[9])
    ]);
    var nearbyData = {
      Schools: distResults[0], Restaurants: distResults[1], Parks: distResults[2],
      Grocery: distResults[3], Medical: distResults[4], Entertainment: distResults[5],
      Golf: distResults[6], Gas: distResults[7], Utilities: distResults[8], Shopping: distResults[9]
    };
    var listing = await generateListing(address, propertyDetails, nearbyData);
    return NextResponse.json({ address: address, lat: lat, lng: lng, nearby: nearbyData, listing: listing });
  } catch (error) {
    console.error('Workspace error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}