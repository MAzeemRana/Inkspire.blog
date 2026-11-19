import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { calculateReadTime } from '@/lib/blog-utils'
import { SEED_CATEGORIES, SEED_POSTS, SEED_SUBSCRIBERS } from '@/lib/seed-data'
import { ensureSchema } from '@/lib/schema-setup'

let seedPromise: Promise<void> | null = null

/** Idempotent seed — runs once, fills the DB with realistic starter content. */
export async function ensureSeed() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureSchema()
      await seed()
    })().catch((e) => {
      seedPromise = null
      throw e
    })
  }
  return seedPromise
}

async function seed() {
  const existingPosts = await db.post.count()
  if (existingPosts > 0) return

  const adminEmail = 'admin@inkspire.io'
  const admin =
    (await db.user.findUnique({ where: { email: adminEmail } })) ??
    (await db.user.create({
      data: {
        email: adminEmail,
        name: 'Alex Carter',
        password: hashPassword('inkspire2026'),
        bio: 'Writer, developer and the voice behind Inkspire. I build things for the web and write about the process.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop',
        role: 'ADMIN',
      },
    }))

  const categories = new Map<string, string>()
  for (const c of SEED_CATEGORIES) {
    const row =
      (await db.category.findUnique({ where: { slug: c.slug } })) ??
      (await db.category.create({ data: c }))
    categories.set(c.name, row.id)
  }

  for (const p of SEED_POSTS) {
    const created = await db.post.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        published: p.published,
        featured: p.featured,
        views: p.views,
        readTime: calculateReadTime(p.content),
        metaTitle: p.metaTitle ?? null,
        metaDescription: p.metaDescription ?? null,
        keywords: p.keywords ?? null,
        authorId: admin.id,
        categoryId: categories.get(p.category) ?? null,
        createdAt: new Date(Date.now() - p.daysAgo * 86400000),
        updatedAt: new Date(Date.now() - p.daysAgo * 86400000),
        tags: {
          create: await Promise.all(
            p.tags.map(async (t) => {
              const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
              const tag =
                (await db.tag.findUnique({ where: { slug } })) ??
                (await db.tag.create({ data: { name: t, slug } }))
              return { tagId: tag.id }
            })
          ),
        },
      },
    })

    if (p.comments?.length) {
      await db.comment.createMany({
        data: p.comments.map((c, i) => ({
          ...c,
          postId: created.id,
          createdAt: new Date(Date.now() - (p.daysAgo - 0.5 + i * 0.2) * 86400000),
        })),
      })
    }
  }

  for (const email of SEED_SUBSCRIBERS) {
    await db.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    })
  }

  await db.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      siteName: 'Inkspire',
      tagline: 'Stories, ideas & insights worth sharing',
      aboutTitle: 'About Inkspire',
      aboutText:
        'Inkspire is a blog about building things for the web and living a more intentional creative life. It covers web development, design, productivity and the honest business of writing online.\n\nEvery article here is written first-hand — from real projects, real numbers and real mistakes. No recycled listicles, no AI content dumps. If a post says "I tested this," the screenshots and the scars are genuine.\n\nInkspire is built with Next.js, Prisma and an unreasonable amount of care about typography. It is deployed on Vercel, indexed on Google, and written in the early morning.',
      twitter: 'https://twitter.com/inkspire',
      github: 'https://github.com/inkspire',
      linkedin: 'https://linkedin.com/company/inkspire',
      contactEmail: 'hello@inkspire.io',
      metaKeywords: 'blog, web development, design, productivity, seo, writing',
      metaDescription:
        'Inkspire is a blog about web development, design, productivity and the honest business of writing online. Stories, ideas and insights worth sharing.',
    },
  })
}
