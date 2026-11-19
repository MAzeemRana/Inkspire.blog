'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus, Search, Pencil, Trash2, Loader2, EyeOff, Eye, Star, StarOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { api, getErrorMessage } from '@/lib/api-client'
import { useAdminStore } from '@/lib/store'
import { formatDate, formatViews } from '@/lib/blog-utils'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'

type StatusFilter = 'all' | 'published' | 'draft'

export function PostsManager() {
  const { openEditor } = useAdminStore()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['posts', 'admin'],
    queryFn: () => api('/api/posts?status=all'),
  })

  const togglePublished = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ published }) }),
    onSuccess: (_, vars) => {
      toast.success(vars.published ? 'Post published. Your sitemap is now updated.' : 'Post moved back to drafts.')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      api(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deletePost = useMutation({
    mutationFn: (id: string) => api(`/api/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Post deleted.')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const posts = useMemo(() => {
    let list = data?.posts ?? []
    if (status === 'published') list = list.filter((p) => p.published)
    if (status === 'draft') list = list.filter((p) => !p.published)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q))
    }
    return list
  }, [data, status, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, publish and track every article.</p>
        </div>
        <Button className="rounded-full gap-2" onClick={() => openEditor(null)}>
          <Plus className="w-4 h-4" /> New post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="pl-10 rounded-full"
            aria-label="Search posts"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'published', 'draft'] as StatusFilter[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? 'secondary' : 'ghost'}
              onClick={() => setStatus(s)}
              className="rounded-full capitalize"
            >
              {s} {s !== 'all' && `(${(data?.posts ?? []).filter((p) => (s === 'published' ? p.published : !p.published)).length})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-lg font-semibold">No posts {status !== 'all' ? `in ${status}` : 'yet'}</p>
            <p className="mt-1 text-sm text-muted-foreground">Click “New post” to write your first article.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[260px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium line-clamp-1">{p.title}</span>
                        {p.featured && <Star className="w-3.5 h-3.5 text-chart-2 fill-current shrink-0" aria-label="Featured" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-[280px]">/{p.slug}</p>
                    </TableCell>
                    <TableCell>
                      {p.category ? (
                        <Badge variant="outline" className="font-normal" style={{ color: p.category.color, borderColor: `${p.category.color}55` }}>
                          {p.category.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.published ? (
                        <Badge className="bg-primary/10 text-primary border-0">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatViews(p.views)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(p.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title={p.published ? 'Unpublish' : 'Publish'}
                          onClick={() => togglePublished.mutate({ id: p.id, published: !p.published })}
                        >
                          {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn('h-8 w-8', p.featured && 'text-chart-2')}
                          title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                          onClick={() => toggleFeatured.mutate({ id: p.id, featured: !p.featured })}
                        >
                          {p.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title="Edit"
                          onClick={() => openEditor(p.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Delete"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the post along with its comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && deletePost.mutate(deleteId)}
              disabled={deletePost.isPending}
            >
              {deletePost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
