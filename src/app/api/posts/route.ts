import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ensureSeed } from '@/lib/seed'
import { calculateReadTime, uniqueSlug } from '@/lib/blog-utils'
import { postInclude, resolveTags } from '@/lib/post-helpers'

export async function GET(req: NextRequest) {
  try {
    await ensureSeed()
    const sp = req.nextUrl.searchParams
    const auth = await requireAuth()
    const status = sp.get('status') // 'published' | 'draft' | null = all visible
    const categoryId = sp.get('category')
    const search = sp.get('search')?.trim()
    const featured = sp.get('featured')
    const limit = Number(sp.get('limit')) || undefined

    const where: Record<string, unknown> = {}
    if (!auth) {
      // Public visitors only ever see published posts
      where.published = true
    } else if (status === 'published') where.published = true
    else if (status === 'draft') where.published = false

    if (categoryId) where.categoryId = categoryId
    if (featured === 'true') where.featured = true
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const posts = await db.post.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    })
    return NextResponse.json({ posts })
  } catch (e) {
    console.error('[posts:GET]', e)
    return NextResponse.json({ error: 'Failed to load posts.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, excerpt, content, coverImage, published, featured, metaTitle, metaDescription, keywords, categoryId, tags } = body
    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title, excerpt and content are required.' }, { status: 400 })
    }

    const post = await db.post.create({
      data: {
        title: title.trim(),
        slug: await uniqueSlug(body.slug || title),
        excerpt: excerpt.trim(),
        content,
        coverImage: coverImage || null,
        published: Boolean(published),
        featured: Boolean(featured),
        readTime: calculateReadTime(content),
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        authorId: auth.id,
        categoryId: categoryId || null,
        tags: {
          create: await resolveTags(tags),
        },
      },
      include: postInclude,
    })
    return NextResponse.json({ post }, { status: 201 })
  } catch (e) {
    console.error('[posts:POST]', e)
    return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 })
  }
}
