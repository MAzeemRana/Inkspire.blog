'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, Eye, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatViews, initials } from '@/lib/blog-utils'
import type { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
  variant?: 'featured' | 'default' | 'compact'
  onOpen: (post: Post) => void
}

export function PostCard({ post, variant = 'default', onOpen }: PostCardProps) {
  const cover = post.coverImage || ''

  if (variant === 'featured') {
    return (
      <article
        onClick={() => onOpen(post)}
        className="group cursor-pointer rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {cover ? (
            <img
              src={cover}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent to-primary/30" />
          )}
          {post.category && (
            <Badge
              className="absolute top-4 left-4 shadow-md border-0"
              style={{ backgroundColor: post.category.color, color: '#fff' }}
            >
              {post.category.name}
            </Badge>
          )}
          <Badge className="absolute top-4 right-4 shadow-md border-0 bg-background/90 text-foreground backdrop-blur">
            <Eye className="w-3 h-3 mr-1" /> {formatViews(post.views)}
          </Badge>
        </div>
        <div className="p-6 md:p-7">
          <h3 className="font-serif text-xl md:text-2xl font-bold leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="mt-3 text-muted-foreground text-[0.95rem] leading-relaxed line-clamp-3">{post.excerpt}</p>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-[0.65rem] font-semibold grid place-items-center">
                {initials(post.author?.name || 'A')}
              </span>
              {post.author?.name || 'Editorial Team'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime} min
            </span>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article
        onClick={() => onOpen(post)}
        className="group cursor-pointer flex gap-4 items-start rounded-xl p-3 hover:bg-accent/60 transition-colors"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
          {cover ? (
            <img src={cover} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-serif font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors text-[0.95rem] md:text-base">
            {post.title}
          </h4>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatDate(post.createdAt)} · {post.readTime} min read
          </p>
        </div>
      </article>
    )
  }

  return (
    <article
      onClick={() => onOpen(post)}
      className={cn(
        'group cursor-pointer rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col'
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent to-primary/30" />
        )}
        {post.category && (
          <Badge
            className="absolute top-3 left-3 shadow-md border-0"
            style={{ backgroundColor: post.category.color, color: '#fff' }}
          >
            {post.category.name}
          </Badge>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(post.createdAt)} · {post.readTime} min read</span>
          <span className="inline-flex items-center gap-1 font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
