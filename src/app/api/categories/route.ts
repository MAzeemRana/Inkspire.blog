import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ensureSeed } from '@/lib/seed'
import { slugify } from '@/lib/blog-utils'

export async function GET() {
  try {
    await ensureSeed()
    const categories = await db.category.findMany({
      include: {
        _count: { select: { posts: { where: { published: true } } } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ categories })
  } catch (e) {
    console.error('[categories:GET]', e)
    return NextResponse.json({ error: 'Failed to load categories.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, description, color } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    const category = await db.category.upsert({
      where: { slug: slugify(name) },
      update: { description: description || null, color: color || '#0d7a5f' },
      create: {
        name: name.trim(),
        slug: slugify(name),
        description: description || null,
        color: color || '#0d7a5f',
      },
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (e) {
    console.error('[categories:POST]', e)
    return NextResponse.json({ error: 'Failed to create category.' }, { status: 500 })
  }
}
