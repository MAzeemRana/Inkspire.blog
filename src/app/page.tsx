import { ensureSeed } from '@/lib/seed'
import { BlogApp } from '@/components/blog-app'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Idempotent seed — fills the database with starter content on first run.
  await ensureSeed().catch((e) => {
    console.error('[seed]', e)
  })
  return <BlogApp />
}
