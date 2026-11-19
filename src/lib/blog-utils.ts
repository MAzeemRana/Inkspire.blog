export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Approximate reading time: 220 words per minute. */
export function calculateReadTime(markdown: string): number {
  const words = markdown
    .replace(/[#*`>\-\[\]()!]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const units: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]
  for (const [secs, label] of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}

export function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return String(views)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Ensures a unique slug in the database. Pass an id to exclude it (updates). */
export async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'post'
  let candidate = root
  let n = 2
  while (true) {
    const existing = await (await import('@/lib/db')).db.post.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
    if (!existing) return candidate
    candidate = `${root}-${n++}`
  }
}
