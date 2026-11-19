import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSeed } from '@/lib/seed'

export async function GET() {
  try {
    await ensureSeed()
    const tags = await db.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ tags })
  } catch (e) {
    console.error('[tags:GET]', e)
    return NextResponse.json({ error: 'Failed to load tags.' }, { status: 500 })
  }
}
