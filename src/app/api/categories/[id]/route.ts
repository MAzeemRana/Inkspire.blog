import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { slugify } from '@/lib/blog-utils'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const { name, description, color } = await req.json()
    const data: Record<string, unknown> = {}
    if (name !== undefined) {
      data.name = name.trim()
      data.slug = slugify(name)
    }
    if (description !== undefined) data.description = description || null
    if (color !== undefined) data.color = color
    const category = await db.category.update({ where: { id }, data })
    return NextResponse.json({ category })
  } catch (e) {
    console.error('[category:PATCH]', e)
    return NextResponse.json({ error: 'Failed to update category. The name may already exist.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const count = await db.post.count({ where: { categoryId: id } })
    if (count > 0) {
      return NextResponse.json(
        { error: `This category has ${count} post(s). Reassign them first.` },
        { status: 400 }
      )
    }
    await db.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[category:DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 })
  }
}
