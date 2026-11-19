import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET comments. With auth: ?status=pending|approved|all (moderation view).
 * Without auth: ?postId=<id> returns approved comments only.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    const sp = req.nextUrl.searchParams
    if (auth) {
      const status = sp.get('status') || 'all'
      const where = status === 'pending' ? { approved: false } : status === 'approved' ? { approved: true } : {}
      const comments = await db.comment.findMany({
        where,
        include: { post: { select: { title: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ comments })
    }
    const postId = sp.get('postId')
    if (!postId) return NextResponse.json({ comments: [] })
    const comments = await db.comment.findMany({
      where: { postId, approved: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ comments })
  } catch (e) {
    console.error('[comments:GET]', e)
    return NextResponse.json({ error: 'Failed to load comments.' }, { status: 500 })
  }
}

/** Public comment submission — lands unapproved for moderation. */
export async function POST(req: NextRequest) {
  try {
    const { name, email, content, postId } = await req.json()
    if (!name?.trim() || !email?.trim() || !content?.trim() || !postId) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post || !post.published) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    }
    const comment = await db.comment.create({
      data: { name: name.trim(), email: email.trim(), content: content.trim(), postId },
    })
    return NextResponse.json({ comment }, { status: 201 })
  } catch (e) {
    console.error('[comments:POST]', e)
    return NextResponse.json({ error: 'Failed to post comment.' }, { status: 500 })
  }
}
