import { db } from '@/lib/db'

/** Standard include shape for post queries. */
export const postInclude = {
  author: { select: { id: true, name: true, bio: true, avatar: true } },
  category: true,
  tags: { include: { tag: true } },
  _count: { select: { comments: true } },
} as const

/** Converts a list of tag names into connect rows, creating tags as needed. */
export async function resolveTags(tags?: string[]) {
  if (!tags?.length) return []
  const out: { tagId: string }[] = []
  for (const name of tags.map((t) => t.trim()).filter(Boolean)) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    if (!slug) continue
    const tag = await db.tag.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    })
    out.push({ tagId: tag.id })
  }
  return out
}
