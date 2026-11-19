import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ subscribers })
  } catch (e) {
    console.error('[subscribers:GET]', e)
    return NextResponse.json({ error: 'Failed to load subscribers.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const valid = email?.trim().toLowerCase()
    if (!valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valid)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    const existing = await db.subscriber.findUnique({ where: { email: valid } })
    if (existing) {
      return NextResponse.json({ message: 'You are already subscribed. See you in the next issue!' })
    }
    await db.subscriber.create({ data: { email: valid } })
    return NextResponse.json({ message: 'Subscribed! Welcome aboard.' }, { status: 201 })
  } catch (e) {
    console.error('[subscribers:POST]', e)
    return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 })
  }
}
