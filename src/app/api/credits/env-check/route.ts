import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasSquareAccessToken: Boolean(process.env.SQUARE_ACCESS_TOKEN),
    squareLocationIdPresent: Boolean(process.env.SQUARE_LOCATION_ID),
    squareLocationIdLength: process.env.SQUARE_LOCATION_ID ? process.env.SQUARE_LOCATION_ID.length : 0,
  });
}
