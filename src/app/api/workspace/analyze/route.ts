import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address, propertyDetails } = await request.json();
    
    // For now, return mock data
    return NextResponse.json({
      address,
      lat: 28.5383,
      lng: -81.3792,
      nearby: {
        Schools: [{ name: 'Sample School', vicinity: '123 Main St', rating: 4.5, distance: '0.5 mi' }],
        Restaurants: [{ name: 'Sample Restaurant', vicinity: '456 Oak Ave', rating: 4.2, distance: '0.3 mi' }],
      },
      listing: 'This is a test listing description that will be replaced with real AI-generated content.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
