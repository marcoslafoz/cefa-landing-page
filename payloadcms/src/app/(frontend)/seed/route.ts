import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Disabled. Please use PAYLOAD_SEED=true via CLI.' })
}
