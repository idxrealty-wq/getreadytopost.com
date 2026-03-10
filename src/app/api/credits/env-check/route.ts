import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasSquareAccessToken: Boolean(process.env.SQUARE_ACCESS_TOKEN),
	ATTOM_API_KEY_present: !!process.env.ATTOM_API_KEY,
    squareLocationIdPresent: Boolean(process.env.SQUARE_LOCATION_ID),
    squareLocationIdLength: process.env.SQUARE_LOCATION_ID ? process.env.SQUARE_LOCATION_ID.length : 0,
  });
}
