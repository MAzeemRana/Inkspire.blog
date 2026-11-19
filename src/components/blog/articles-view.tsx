'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, LayoutList } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/blog/post-card'
import { Newsletter } from '@/components/blog/newsletter'
import { api } from '@/lib/api-client'
import { useNavigate } from '@/lib/router'
import { cn } from '@/lib/utils'
import type { Post, Category } from '@/lib/types'

interface ArticlesViewProps {
  presetCategory?: string | null
}

export function ArticlesView({ presetCategory = null }: ArticlesViewProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(presetCategory)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const { data: postsData, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['posts', 'articles'],
    queryFn: () => api('/api/posts'),
  })
  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api('/api/categories'),
  })

  const categories = catData?.categories ?? []
  const posts = postsData?.posts ?? []

  const allTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) for (const t of p.tags) counts.set(t.tag.name, (counts.get(t.tag.name) || 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14)
  }, [posts])

  const filtered = useMemo(() => {
    let list = posts
    if (activeCategory) {
      const cat = categories.find((c) => c.id === activeCategory)
      list = list.filter((p) => p.categoryId === activeCategory || p.category?.slug === cat?.slug)
    }
    if (activeTag) list = list.filter((p) => p.tags.some((t) => t.tag.name === activeTag))
    if (search.trim()) {
      const words = search.toLowerCase().split(/\s+/).filter(Boolean)
      list = list.filter((p) => {
        const haystack = `${p.title} ${p.excerpt} ${p.content}`.toLowerCase()
        return words.every((w) => haystack.includes(w))
      })
    }
    return list
  }, [posts, categories, activeCategory, activeTag, search])

  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name

  return (
    <>
      <section className="border-b bg-gradient-to-b from-accent/50 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-14">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">
            {activeCategoryName ? `Articles in ${activeCategoryName}` : 'All articles'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading ? 'Loading…' : `${filtered.length} article${filtered.length === 1 ? '' : 's'} to dig into.`}
          </p>
          <div className="mt-6 relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, topics, keywords…"
              aria-label="Search articles"
              className="h-12 pl-11 rounded-full bg-card"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={!activeCategory ? 'secondary' : 'ghost'}
            onClick={() => setActiveCategory(null)}
            className="rounded-full h-8"
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={activeCategory === c.id ? 'secondary' : 'ghost'}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className="rounded-full h-8"
              style={activeCategory === c.id ? { backgroundColor: `${c.color}1a`, color: c.color } : undefined}
            >
              {c.name}
            </Button>
          ))}
        </div>

        {/* Tag cloud */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="text-xs text-muted-foreground font-medium mr-1">Tags:</span>
            {allTags.map(([tag, count]) => (
              <Badge
                key={tag}
                variant={activeTag === tag ? 'default' : 'outline'}
                className="cursor-pointer rounded-full px-3 py-1 text-xs font-normal hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag} <span className="ml-1 opacity-60">{count}</span>
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3.4] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn('text-center py-20 rounded-2xl border border-dashed')}>
            <LayoutList className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <p className="mt-4 font-serif text-xl font-semibold">No articles found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search term or clear the filters.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 rounded-full"
              onClick={() => {
                setSearch('')
                setActiveTag(null)
                setActiveCategory(null)
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} onOpen={(x) => navigate({ name: 'post', postId: x.id, slug: x.slug })} />
            ))}
          </div>
        )}
      </section>

      {!presetCategory && <Newsletter />}
    </>
  )
}
