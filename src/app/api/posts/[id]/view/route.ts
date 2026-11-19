import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Public view counter — increments once per request, published posts only. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await db.post.findUnique({ where: { id }, select: { published: true } })
    if (!post || !post.published) {
      return NextResponse.json({ ok: false, error: 'Post not found.' }, { status: 404 })
    }
    await db.post.update({ where: { id }, data: { views: { increment: 1 } } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[post:view]', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
