'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, Eye, Loader2, Star, ImagePlus, RefreshCw, Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Markdown } from '@/components/blog/markdown'
import { api, getErrorMessage } from '@/lib/api-client'
import { useAdminStore } from '@/lib/store'
import { slugify, calculateReadTime } from '@/lib/blog-utils'
import { cn } from '@/lib/utils'
import type { Post, Category, PostPayload } from '@/lib/types'

interface FormState {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  categoryId: string
  tags: string
  metaTitle: string
  metaDescription: string
  keywords: string
  published: boolean
  featured: boolean
}

function buildForm(post: Post | null): FormState {
  return post
    ? {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage || '',
        categoryId: post.categoryId || '',
        tags: post.tags.map((t) => t.tag.name).join(', '),
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        keywords: post.keywords || '',
        published: post.published,
        featured: post.featured,
      }
    : {
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        categoryId: '',
        tags: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        published: false,
        featured: false,
      }
}

export function PostEditor() {
  const { editingPostId, setTab } = useAdminStore()

  const { data: postData, isLoading } = useQuery<{ post: Post }>({
    queryKey: ['post', editingPostId],
    queryFn: () => api(`/api/posts/${editingPostId}`),
    enabled: !!editingPostId,
  })

  if (editingPostId && isLoading) {
    return (
      <div className="space-y-5 max-w-4xl">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  // key forces a fresh form when switching posts (state initialized from props)
  return (
    <PostForm
      key={editingPostId || 'new'}
      initialPost={postData?.post ?? null}
      onDone={() => setTab('posts')}
    />
  )
}

function PostForm({
  initialPost,
  onDone,
}: {
  initialPost: Post | null
  onDone: () => void
}) {
  const { openEditor } = useAdminStore()
  const queryClient = useQueryClient()
  const editingPostId = initialPost?.id ?? null
  const [form, setForm] = useState<FormState>(() => buildForm(initialPost))
  const [slugEdited, setSlugEdited] = useState(!!initialPost)

  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api('/api/categories'),
  })

  const setField = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const slug = useMemo(
    () => (slugEdited ? form.slug : slugify(form.title)),
    [form.slug, form.title, slugEdited]
  )

  const save = useMutation({
    mutationFn: async () => {
      const payload: PostPayload = {
        title: form.title,
        slug,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        published: form.published,
        featured: form.featured,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        keywords: form.keywords,
        categoryId: form.categoryId || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }
      if (!payload.title.trim()) throw new Error('Title is required.')
      if (!payload.excerpt.trim()) throw new Error('Excerpt is required.')
      if (!payload.content.trim()) throw new Error('Content is required.')

      if (editingPostId) {
        return api<{ post: Post }>(`/api/posts/${editingPostId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      }
      return api<{ post: Post }>('/api/posts', { method: 'POST', body: JSON.stringify(payload) })
    },
    onSuccess: (res) => {
      toast.success(
        form.published
          ? `Saved and published: “${res.post.title}”. It is now live and in the sitemap.`
          : `Draft saved: “${res.post.title}”.`
      )
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      onDone()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const words = form.content.split(/\s+/).filter(Boolean).length

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onDone} aria-label="Back to posts">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-bold">{editingPostId ? 'Edit post' : 'New post'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {calculateReadTime(form.content)} min read · {words} words
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Switch checked={form.featured} onCheckedChange={(v) => setField('featured', v)} />
            <Star className={cn('w-4 h-4', form.featured ? 'text-chart-2 fill-current' : 'text-muted-foreground')} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Switch checked={form.published} onCheckedChange={(v) => setField('published', v)} />
            {form.published ? 'Published' : 'Draft'}
          </label>
          <Button
            className="rounded-full gap-2 font-semibold"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {/* Title + slug + excerpt */}
        <Card>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="An irresistible, descriptive headline…"
                className="h-12 font-serif text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-slug" className="flex items-center justify-between">
                <span>URL slug</span>
                {!slugEdited && <span className="text-xs text-muted-foreground font-normal">auto-generated from title</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="post-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true)
                    setField('slug', e.target.value)
                  }}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Regenerate from title"
                  onClick={() => {
                    setSlugEdited(false)
                    setField('slug', slugify(form.title))
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Textarea
                id="post-excerpt"
                value={form.excerpt}
                onChange={(e) => setField('excerpt', e.target.value)}
                placeholder="One or two sentences that summarize the article — shown in listings, cards and search results."
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Content editor */}
        <Card>
          <Tabs defaultValue="write">
            <div className="flex items-center justify-between pr-4 border-b">
              <TabsList className="bg-transparent h-12 rounded-none p-0 gap-1 px-3">
                <TabsTrigger value="write" className="rounded-full data-[state=active]:bg-secondary data-[state=active]:shadow-none px-4 h-8">
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-full data-[state=active]:bg-secondary data-[state=active]:shadow-none px-4 h-8 gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </TabsTrigger>
              </TabsList>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Markdown supported — # headings, **bold**, lists, {'>'} quotes, `code`
              </span>
            </div>
            <TabsContent value="write" className="mt-0">
              <Textarea
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
                placeholder={'Write your article in Markdown…\n\n## Section heading\n\nYour text here. **Bold**, *italic*, `inline code`.\n\n- list item\n- list item\n\n> A memorable quote'}
                rows={18}
                className="border-0 rounded-none focus-visible:ring-0 font-mono text-[0.925rem] leading-relaxed min-h-[430px]"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-0">
              <div className="min-h-[430px] p-6 bg-card rounded-b-lg">
                {form.content.trim() ? (
                  <Markdown content={form.content} />
                ) : (
                  <p className="text-sm text-muted-foreground py-16 text-center">Nothing to preview yet — start writing on the Write tab.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Category + tags + cover */}
        <Card>
          <div className="p-5 grid md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <select
                  id="post-category"
                  value={form.categoryId}
                  onChange={(e) => setField('categoryId', e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No category</option>
                  {(catData?.categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-tags">Tags</Label>
                <Input
                  id="post-tags"
                  value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)}
                  placeholder="Next.js, SEO, Tutorial"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, i) => (
                    <Badge key={`${t}-${i}`} variant="secondary" className="rounded-full font-normal text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-cover" className="flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5" /> Cover image URL
              </Label>
              <Input
                id="post-cover"
                value={form.coverImage}
                onChange={(e) => setField('coverImage', e.target.value)}
                placeholder="https://images.unsplash.com/…"
                className="font-mono text-xs"
              />
              <div className="rounded-lg border bg-muted/40 aspect-[16/9] overflow-hidden grid place-items-center mt-1">
                {form.coverImage ? (
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="text-center text-xs text-muted-foreground p-4">
                    <ImagePlus className="w-8 h-8 mx-auto opacity-40" />
                    <p className="mt-2">Paste any image URL — Unsplash, Cloudinary, your CDN.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* SEO panel */}
        <Card>
          <div className="p-5 space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" /> SEO &amp; Google indexing
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                These fields power your meta tags, Open Graph previews and JSON-LD structured data.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="post-meta-title">Meta title</Label>
                <span className={cn('text-xs tabular-nums', (form.metaTitle || form.title).length > 60 ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                  {(form.metaTitle || form.title).length}/60
                </span>
              </div>
              <Input
                id="post-meta-title"
                value={form.metaTitle}
                onChange={(e) => setField('metaTitle', e.target.value)}
                placeholder={form.title || 'Defaults to the post title'}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="post-meta-desc">Meta description</Label>
                <span className={cn('text-xs tabular-nums', (form.metaDescription || form.excerpt).length > 160 ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                  {(form.metaDescription || form.excerpt).length}/160
                </span>
              </div>
              <Textarea
                id="post-meta-desc"
                value={form.metaDescription}
                onChange={(e) => setField('metaDescription', e.target.value)}
                placeholder={form.excerpt || 'Defaults to the excerpt'}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-keywords">Keywords (comma-separated)</Label>
              <Input
                id="post-keywords"
                value={form.keywords}
                onChange={(e) => setField('keywords', e.target.value)}
                placeholder="next.js blog, seo, tutorial"
              />
            </div>

            {/* Google result preview */}
            <div className="rounded-xl border p-4 bg-card">
              <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">Google search preview</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">yourdomain.com › ?post={slug || 'your-post'}</p>
                <p className="text-[1.05rem] text-primary leading-snug">
                  {(form.metaTitle || form.title || 'Your post title').slice(0, 70)}
                </p>
                <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                  {(form.metaDescription || form.excerpt || 'Your meta description will appear here — write one for better click-through rates.').slice(0, 180)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Button variant="ghost" className="gap-2" onClick={() => openEditor(null)}>
            Start a fresh post
          </Button>
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save {form.published ? 'and publish' : 'draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}
