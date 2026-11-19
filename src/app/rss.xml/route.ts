import { db } from '@/lib/db'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const dynamic = 'force-dynamic'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripMarkdown(md: string): string {
  return md
    .replace(/[#*`>\-\[\]()!_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * RSS 2.0 feed — every published post. Readers and aggregators subscribe at /rss.xml.
 */
export async function GET() {
  let posts: {
    title: string
    slug: string
    excerpt: string
    content: string
    createdAt: Date
    authorName?: string
  }[] = []

  try {
    const rows = await db.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    })
    posts = rows.map((r) => ({ ...r, authorName: r.author?.name }))
  } catch {
    // Database not ready — still emit a valid (empty) feed.
  }

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/?post=${encodeURIComponent(p.slug)}`
      const date = p.createdAt.toUTCString()
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(p.excerpt || stripMarkdown(p.content).slice(0, 300))}</description>
      ${p.authorName ? `<dc:creator>${escapeXml(p.authorName)}</dc:creator>` : ''}
      <pubDate>${date}</pubDate>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Inkspire — Stories, ideas &amp; insights worth sharing</title>
    <link>${SITE_URL}</link>
    <description>A blog about web development, design, productivity and the honest business of writing online.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  })
}
