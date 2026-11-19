import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const { approved } = await req.json()
    const existing = await db.comment.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
    const comment = await db.comment.update({ where: { id }, data: { approved: Boolean(approved) } })
    return NextResponse.json({ comment })
  } catch (e) {
    console.error('[comment:PATCH]', e)
    return NextResponse.json({ error: 'Failed to update comment.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const existing = await db.comment.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
    await db.comment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[comment:DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete comment.' }, { status: 500 })
  }
}
