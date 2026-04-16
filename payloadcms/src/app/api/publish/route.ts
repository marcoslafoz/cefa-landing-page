import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config: configPromise })

  let authenticated = false
  try {
    const { user } = await payload.auth({ headers: req.headers })
    authenticated = !!user
  } catch {
    authenticated = false
  }

  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const webhookUrl = process.env.PUBLISH_WEBHOOK_URL || 'http://orchestrator:4000/webhook/publish'

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Orchestrator returned ${response.status}`)
    }

    return NextResponse.json(
      { queued: true, message: 'Request sent to orchestrator. Publishing in progress.' },
      { status: 202 },
    )
  } catch (error) {
    console.error('Error sending webhook to orchestrator:', error)
    return NextResponse.json(
      { error: 'Could not connect to orchestrator' },
      { status: 500 },
    )
  }
}
