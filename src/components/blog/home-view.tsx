'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Eye, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/blog/post-card'
import { Newsletter } from '@/components/blog/newsletter'
import { api } from '@/lib/api-client'
import { useNavigate } from '@/lib/router'
import { formatViews } from '@/lib/blog-utils'
import type { Post, Category } from '@/lib/types'

export function HomeView() {
  const navigate = useNavigate()

  const { data: postsData, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['posts', 'home'],
    queryFn: () => api('/api/posts'),
  })
  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api('/api/categories'),
  })

  const posts = postsData?.posts ?? []
  const categories = (catData?.categories ?? []).filter((c) => c._count?.posts)
  const hero = posts.find((p) => p.featured) ?? posts[0]
  const featured = posts.filter((p) => p.featured && p.id !== hero?.id).slice(0, 2)
  const latest = posts.filter((p) => p.id !== hero?.id && !featured.some((f) => f.id === p.id)).slice(0, 6)

  const totalViews = posts.reduce((s, p) => s + p.views, 0)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/60 via-background to-background">
        <div className="absolute inset-0 dot-grid opacity-60" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div>
              <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm border-primary/40 text-primary bg-primary/5">
                Weekly essays on building for the web
              </Badge>
              <h1 className="mt-5 font-serif text-4xl sm:text-5xl md:text-[3.4rem] font-bold leading-[1.12] tracking-tight">
                Stories, ideas &amp; insights{' '}
                <span className="text-primary">worth sharing</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
                Practical guides on web development, design, productivity and the honest business
                of writing online — written from first-hand experience, not theory.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" className="rounded-full px-7 h-12 font-semibold gap-2" onClick={() => navigate({ name: 'articles' })}>
                  Start reading <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-7 h-12 font-semibold" onClick={() => navigate({ name: 'about' })}>
                  About the blog
                </Button>
              </div>
              <div className="mt-9 flex items-center gap-8 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <strong className="text-foreground font-semibold">{posts.length}</strong> articles
                </span>
                <span className="inline-flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <strong className="text-foreground font-semibold">{formatViews(totalViews)}</strong> reads
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <strong className="text-foreground font-semibold">500+</strong> subscribers
                </span>
              </div>
            </div>

            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
              ) : hero ? (
                <PostCard post={hero} variant="featured" onOpen={(p) => navigate({ name: 'post', postId: p.id, slug: p.slug })} />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10" aria-label="Categories">
          <div className="flex flex-wrap items-center gap-2.5">
            {categories.map((c) => (
              <button key={c.id} onClick={() => navigate({ name: 'category', categoryId: c.id, slug: c.slug })} className="group">
                <Badge
                  variant="outline"
                  className="rounded-full px-4 py-1.5 text-sm cursor-pointer hover:text-white transition-colors font-medium"
                  style={{ borderColor: `${c.color}55`, color: c.color }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.color)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = ''
                    e.currentTarget.style.color = c.color
                  }}
                  onMouseOut={(e) => (e.currentTarget.style.color = c.color)}
                >
                  {c.name}
                  <span className="ml-1.5 opacity-70">{c._count?.posts}</span>
                </Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12" aria-label="Featured stories">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Featured stories</h2>
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {featured.map((p) => (
              <PostCard key={p.id} post={p} onOpen={(x) => navigate({ name: 'post', postId: x.id, slug: x.slug })} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12" aria-label="Latest articles">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold">Latest articles</h2>
          <Button variant="ghost" className="gap-1.5 text-primary font-medium" onClick={() => navigate({ name: 'articles' })}>
            View all <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3.4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((p) => (
              <PostCard key={p.id} post={p} onOpen={(x) => navigate({ name: 'post', postId: x.id, slug: x.slug })} />
            ))}
          </div>
        )}
      </section>

      <div className="pt-4">
        <Newsletter />
      </div>
    </>
  )
}
