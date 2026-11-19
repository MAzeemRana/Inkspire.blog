import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ensureSeed } from '@/lib/seed'

export async function GET() {
  try {
    await ensureSeed()
    let settings = await db.settings.findUnique({ where: { id: 'main' } })
    if (!settings) {
      settings = await db.settings.create({
        data: { id: 'main', aboutText: 'This blog is under construction.' },
      })
    }
    return NextResponse.json({ settings })
  } catch (e) {
    console.error('[settings:GET]', e)
    return NextResponse.json({ error: 'Failed to load settings.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const allowed = [
      'siteName',
      'tagline',
      'aboutTitle',
      'aboutText',
      'twitter',
      'github',
      'linkedin',
      'contactEmail',
      'metaKeywords',
      'metaDescription',
    ] as const
    const data: Record<string, string> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = String(body[key] ?? '')
    }
    const settings = await db.settings.upsert({
      where: { id: 'main' },
      update: data,
      create: { id: 'main', ...data, aboutText: data.aboutText || 'This blog is under construction.' },
    })
    return NextResponse.json({ settings })
  } catch (e) {
    console.error('[settings:PATCH]', e)
    return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 })
  }
}
