import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { calculateReadTime, uniqueSlug } from '@/lib/blog-utils'
import { postInclude, resolveTags } from '@/lib/post-helpers'

/** GET a single post by id (admin) or slug (public). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth()
    const post = await db.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        ...postInclude,
        comments: auth
          ? { orderBy: { createdAt: 'desc' } }
          : { where: { approved: true }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    if (!post.published && !auth) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    }
    return NextResponse.json({ post })
  } catch (e) {
    console.error('[post:GET]', e)
    return NextResponse.json({ error: 'Failed to load post.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json()

    const existing = await db.post.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title.trim()
    if (body.slug !== undefined && body.slug !== existing.slug) {
      data.slug = await uniqueSlug(body.slug || existing.title, id)
    }
    if (body.excerpt !== undefined) data.excerpt = body.excerpt.trim()
    if (body.content !== undefined) {
      data.content = body.content
      data.readTime = calculateReadTime(body.content)
    }
    if (body.coverImage !== undefined) data.coverImage = body.coverImage || null
    if (body.published !== undefined) data.published = Boolean(body.published)
    if (body.featured !== undefined) data.featured = Boolean(body.featured)
    if (body.metaTitle !== undefined) data.metaTitle = body.metaTitle || null
    if (body.metaDescription !== undefined) data.metaDescription = body.metaDescription || null
    if (body.keywords !== undefined) data.keywords = body.keywords || null
    if (body.categoryId !== undefined) data.categoryId = body.categoryId || null

    const post = await db.post.update({
      where: { id },
      data: {
        ...data,
        ...(body.tags !== undefined
          ? { tags: { deleteMany: {}, create: await resolveTags(body.tags) } }
          : {}),
      },
      include: postInclude,
    })
    return NextResponse.json({ post })
  } catch (e) {
    console.error('[post:PATCH]', e)
    return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const existing = await db.post.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    await db.post.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[post:DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 })
  }
}
