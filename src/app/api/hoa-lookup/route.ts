import { NextRequest, NextResponse } from 'next/server';

// Mock HOA database - replace with ATTOM API or your actual data source
const hoaDatabase: Record<string, any[]> = {
  isleworth: [
    {
      subdivisionName: 'Isleworth',
      hoaName: 'Isleworth Community Association',
      hoaFees: '$450 - $650 per month',
      hoaAmenities: ['Golf Course', 'Tennis Courts', 'Swimming Pool', 'Fitness Center', 'Community Center', 'Walking Trails'],
      hoaRules: 'Strict architectural guidelines. Minimum lot size 1 acre. No commercial vehicles. Landscaping must be maintained year-round.',
      hoaContactInfo: 'Phone: (407) 876-2600 | Email: info@isleworthfl.com | Website: www.isleworthfl.com',
      numberOfHomes: 850,
      address: 'Windermere, FL',
    },
  ],
  'baldwin park': [
    {
      subdivisionName: 'Baldwin Park',
      hoaName: 'Baldwin Park Homeowners Association',
      hoaFees: '$300 - $450 per month',
      hoaAmenities: ['Community Pool', 'Playground', 'Clubhouse', 'Walking Paths'],
      hoaRules: 'Exterior colors must be approved. Pets allowed with restrictions. Rental restrictions apply.',
      hoaContactInfo: 'Phone: (407) 654-3210 | Email: contact@baldwinparkfl.com',
      numberOfHomes: 1200,
      address: 'Orlando, FL',
    },
  ],
  'lake nona': [
    {
      subdivisionName: 'Lake Nona',
      hoaName: 'Lake Nona Community Development District',
      hoaFees: '$200 - $350 per month',
      hoaAmenities: ['Medical City', 'Shopping District', 'Parks', 'Fitness Facilities', 'Schools'],
      hoaRules: 'Mixed-use community. Residential and commercial areas. Standard HOA rules apply.',
      hoaContactInfo: 'Phone: (407) 850-8000 | Email: info@lakenona.com | Website: www.lakenona.com',
      numberOfHomes: 5000,
      address: 'Orlando, FL',
    },
  ],
  'keenes pointe': [
    {
      subdivisionName: "Keene's Pointe",
      hoaName: "Keene's Pointe Homeowners Association",
      hoaFees: '$250 - $400 per month',
      hoaAmenities: ['Golf Course', 'Swimming Pool', 'Tennis Courts', 'Clubhouse', 'Fitness Center'],
      hoaRules: 'Golf community with strict architectural standards. Minimum home value requirements.',
      hoaContactInfo: 'Phone: (407) 876-5555 | Email: info@kenespointe.com',
      numberOfHomes: 600,
      address: 'Windermere, FL',
    },
  ],
  'phillips landing': [
    {
      subdivisionName: 'Phillips Landing',
      hoaName: 'Phillips Landing Homeowners Association',
      hoaFees: '$275 - $425 per month',
      hoaAmenities: ['Waterfront Access', 'Boat Ramp', 'Community Dock', 'Clubhouse', 'Playground'],
      hoaRules: 'Waterfront community. Boat ownership allowed. Dock usage fees may apply separately.',
      hoaContactInfo: 'Phone: (407) 656-7890 | Email: info@phillipslanding.com',
      numberOfHomes: 400,
      address: 'Ocoee, FL',
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query parameter' },
        { status: 400 }
      );
    }

    const searchTerm = query.toLowerCase().trim();
    const results: any[] = [];

    // Search through mock database
    for (const [key, communities] of Object.entries(hoaDatabase)) {
      if (key.includes(searchTerm) || communities.some(c => c.subdivisionName.toLowerCase().includes(searchTerm))) {
        results.push(...communities);
      }
    }

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('HOA Lookup Error:', error);
    return NextResponse.json(
      { error: 'Failed to process HOA lookup' },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use POST method for HOA lookup' },
    { status: 405 }
  );
}
