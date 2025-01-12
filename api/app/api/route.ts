

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error :', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
