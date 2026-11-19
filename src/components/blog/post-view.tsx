'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft, Clock, Eye, Calendar, Link2, Check, MessageSquare,
  Loader2, Send, Tag, Twitter, Feather,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Markdown } from '@/components/blog/markdown'
import { PostCard } from '@/components/blog/post-card'
import { api, getErrorMessage } from '@/lib/api-client'
import { useNavigate } from '@/lib/router'
import { formatDate, formatViews, initials } from '@/lib/blog-utils'
import type { Post, CommentItem } from '@/lib/types'

interface PostViewProps {
  postId: string
}

export function PostView({ postId }: PostViewProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const countedRef = useRef<Set<string>>(new Set())

  const { data, isLoading, error } = useQuery<{ post: Post }>({
    queryKey: ['post', postId],
    queryFn: () => api(`/api/posts/${postId}`),
  })

  // Count the read once per opened article (guards against StrictMode/refetch double-fires)
  useEffect(() => {
    const id = data?.post?.id
    if (id && !countedRef.current.has(id)) {
      countedRef.current.add(id)
      fetch(`/api/posts/${id}/view`, { method: 'POST' }).catch(() => {})
    }
  }, [data?.post?.id])

  const post = data?.post
  const shareUrl = useMemo(() => {
    if (!post) return ''
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/?post=${encodeURIComponent(post.slug)}`
  }, [post?.slug])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy the link.')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="aspect-[16/8] w-full rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="font-serif text-2xl font-bold">Article not found</p>
        <p className="mt-2 text-muted-foreground">It may have been unpublished or removed.</p>
        <Button className="mt-6 rounded-full" onClick={() => navigate({ name: 'articles' })}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to articles
        </Button>
      </div>
    )
  }

  const metaTitle = post.metaTitle || post.title
  const metaDescription = post.metaDescription || post.excerpt

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metaTitle,
    description: metaDescription,
    image: post.coverImage || undefined,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author?.name || 'Editorial Team' },
    publisher: { '@type': 'Organization', name: 'Inkspire' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    keywords: post.keywords || post.tags.map((t) => t.tag.name).join(', '),
    wordCount: post.content.split(/\s+/).length,
  }

  return (
    <article className="pb-10">
      {/* JSON-LD structured data for Google rich results */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <Button variant="ghost" size="sm" className="rounded-full gap-2 -ml-2" onClick={() => navigate({ name: 'articles' })}>
          <ArrowLeft className="w-4 h-4" /> All articles
        </Button>

        <header className="mt-6">
          {post.category && (
            <button onClick={() => navigate({ name: 'category', categoryId: post.category!.id, slug: post.category!.slug })}>
              <Badge className="border-0 text-white" style={{ backgroundColor: post.category.color }}>
                {post.category.name}
              </Badge>
            </button>
          )}
          <h1 className="mt-4 font-serif text-3xl md:text-[2.6rem] font-bold leading-[1.15] tracking-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2.5">
              <Avatar className="w-9 h-9">
                {post.author?.avatar ? <AvatarImage src={post.author.avatar} alt={post.author.name} /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials(post.author?.name || 'A')}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{post.author?.name || 'Editorial Team'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime} min read</span>
            <span className="inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {formatViews(post.views)} views</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={copyLink}>
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <Twitter className="w-3.5 h-3.5" /> Share
              </Button>
            </a>
          </div>
        </header>

        {post.coverImage && (
          <figure className="mt-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-[16/8] object-cover rounded-2xl shadow-md"
            />
          </figure>
        )}

        <div className="mt-10">
          <Markdown content={post.content} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            {post.tags.map((t) => (
              <Badge key={t.tag.id} variant="outline" className="rounded-full px-3 py-1 font-normal">
                {t.tag.name}
              </Badge>
            ))}
          </div>
        )}

        {post.author && (
          <div className="mt-10 rounded-2xl border bg-card p-6 flex gap-4 items-start">
            <Avatar className="w-12 h-12 shrink-0">
              {post.author.avatar ? <AvatarImage src={post.author.avatar} alt={post.author.name} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Written by</p>
              <p className="font-serif text-lg font-bold">{post.author.name}</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{post.author.bio}</p>
            </div>
          </div>
        )}

        <Separator className="my-10" />
        <CommentsSection postId={post.id} />
        <RelatedPosts current={post} />
      </div>
    </article>
  )
}

function CommentsSection({ postId }: { postId: string }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', email: '', content: '' })

  const { data, isLoading } = useQuery<{ comments: CommentItem[] }>({
    queryKey: ['comments', postId],
    queryFn: () => api(`/api/comments?postId=${postId}`),
  })

  const submit = useMutation({
    mutationFn: () =>
      api('/api/comments', { method: 'POST', body: JSON.stringify({ ...form, postId }) }),
    onSuccess: () => {
      toast.success('Comment submitted! It will appear once approved.')
      setForm({ name: '', email: '', content: '' })
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const comments = data?.comments ?? []

  return (
    <section aria-label="Comments">
      <h2 className="font-serif text-2xl font-bold flex items-center gap-2.5">
        <MessageSquare className="w-5 h-5 text-primary" /> Comments ({comments.length})
      </h2>

      <div className="mt-6 space-y-5">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No comments yet — be the first to share your thoughts.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground text-xs font-semibold grid place-items-center">
                  {initials(c.name)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</p>
                </div>
              </div>
              <p className="mt-3 text-[0.95rem] text-foreground/90 leading-relaxed">{c.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold">Leave a comment</h3>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            submit.mutate()
          }}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-label="Your name"
            />
            <Input
              required
              type="email"
              placeholder="Email (never shown)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              aria-label="Email"
            />
          </div>
          <Textarea
            required
            placeholder="Share your thoughts…"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            aria-label="Comment"
          />
          <Button type="submit" disabled={submit.isPending} className="rounded-full gap-2">
            {submit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post comment
          </Button>
        </form>
      </div>
    </section>
  )
}

function RelatedPosts({ current }: { current: Post }) {
  const navigate = useNavigate()
  const { data } = useQuery<{ posts: Post[] }>({
    queryKey: ['posts', 'related', current.categoryId],
    queryFn: () =>
      api(
        `/api/posts${current.categoryId ? `?category=${encodeURIComponent(current.categoryId)}` : ''}`
      ),
  })
  const related = (data?.posts ?? [])
    .filter((p) => p.id !== current.id && p.categoryId === current.categoryId)
    .slice(0, 3)

  if (related.length === 0) return null

  return (
    <section className="mt-12" aria-label="Related articles">
      <h2 className="font-serif text-2xl font-bold flex items-center gap-2.5">
        <Feather className="w-5 h-5 text-primary" /> Keep reading
      </h2>
      <div className="mt-6 grid sm:grid-cols-3 gap-5">
        {related.map((p) => (
          <PostCard key={p.id} post={p} onOpen={(x) => navigate({ name: 'post', postId: x.id, slug: x.slug })} />
        ))}
      </div>
    </section>
  )
}
