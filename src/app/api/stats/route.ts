import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ensureSeed } from '@/lib/seed'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await ensureSeed()

    const [publishedPosts, draftPosts, comments, subscribers, categories, recentPosts, topPosts, allPosts] =
      await Promise.all([
        db.post.count({ where: { published: true } }),
        db.post.count({ where: { published: false } }),
        db.comment.findMany({ select: { approved: true } }),
        db.subscriber.count(),
        db.category.count(),
        db.post.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            published: true,
            views: true,
            createdAt: true,
            category: { select: { name: true, color: true } },
          },
        }),
        db.post.findMany({
          where: { published: true },
          orderBy: { views: 'desc' },
          take: 5,
          select: { id: true, title: true, views: true },
        }),
        db.post.findMany({ select: { views: true } }),
      ])

    return NextResponse.json({
      stats: {
        publishedPosts,
        draftPosts,
        totalViews: allPosts.reduce((sum, p) => sum + p.views, 0),
        pendingComments: comments.filter((c) => !c.approved).length,
        approvedComments: comments.filter((c) => c.approved).length,
        subscribers,
        categories,
        recentPosts,
        topPosts,
      },
    })
  } catch (e) {
    console.error('[stats:GET]', e)
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 })
  }
}
