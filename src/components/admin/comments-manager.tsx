'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, X, Trash2, Loader2, MessageSquare, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { api, getErrorMessage } from '@/lib/api-client'
import { formatDate, initials } from '@/lib/blog-utils'
import { cn } from '@/lib/utils'
import type { CommentItem } from '@/lib/types'

type Filter = 'pending' | 'approved' | 'all'

export function CommentsManager() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<Filter>('pending')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ comments: CommentItem[] }>({
    queryKey: ['comments', 'admin'],
    queryFn: () => api('/api/comments?status=all'),
  })

  const moderate = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      api(`/api/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ approved }) }),
    onSuccess: (_, vars) => {
      toast.success(vars.approved ? 'Comment approved and now visible on the blog.' : 'Comment moved back to pending.')
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/comments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Comment deleted.')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const all = data?.comments ?? []
  const comments = all.filter((c) => (filter === 'pending' ? !c.approved : filter === 'approved' ? c.approved : true))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-bold">Comments</h1>
        <p className="text-sm text-muted-foreground mt-1">Reader comments land here first — approve to publish them on the blog.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(['pending', 'approved', 'all'] as Filter[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'secondary' : 'ghost'}
            onClick={() => setFilter(f)}
            className="rounded-full capitalize"
          >
            {f} ({all.filter((c) => (f === 'pending' ? !c.approved : f === 'approved' ? c.approved : true)).length})
          </Button>
        ))}
        {filter !== 'approved' && all.some((c) => !c.approved) && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto rounded-full gap-2"
            onClick={() => {
              const pending = all.filter((c) => !c.approved)
              pending.forEach((c) => moderate.mutate({ id: c.id, approved: true }))
            }}
          >
            <CheckCheck className="w-4 h-4" /> Approve all pending
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="mt-4 font-serif text-lg font-semibold">No {filter !== 'all' ? filter : ''} comments</p>
          <p className="mt-1 text-sm text-muted-foreground">New reader comments will appear here for moderation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <Card key={c.id} className={cn('rounded-xl', !c.approved && 'border-chart-2/40')}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-full bg-accent text-accent-foreground text-xs font-semibold grid place-items-center shrink-0">
                      {initials(c.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {c.name} <span className="font-normal text-muted-foreground">· {c.email}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        on <span className="font-medium text-foreground/80">{c.post?.title || 'a post'}</span> · {formatDate(c.createdAt)}
                      </p>
                    </div>
                  </div>
                  {c.approved ? (
                    <Badge className="bg-primary/10 text-primary border-0 shrink-0">Approved</Badge>
                  ) : (
                    <Badge variant="outline" className="border-chart-2/50 text-chart-2 shrink-0">Pending</Badge>
                  )}
                </div>
                <p className="mt-3.5 text-[0.95rem] text-foreground/90 leading-relaxed rounded-lg bg-muted/50 p-3.5">
                  {c.content}
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  {c.approved ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full gap-1.5"
                      onClick={() => moderate.mutate({ id: c.id, approved: false })}
                    >
                      <X className="w-4 h-4" /> Unpublish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-full gap-1.5"
                      onClick={() => moderate.mutate({ id: c.id, approved: true })}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(c.id)}
                  >
                    {deleteId === c.id && remove.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the comment. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && remove.mutate(deleteId)}
              disabled={remove.isPending}
            >
              {remove.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
