'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, FolderOpen, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { api, getErrorMessage } from '@/lib/api-client'
import type { Category } from '@/lib/types'

interface Draft {
  name: string
  description: string
  color: string
}

const COLORS = ['#0d7a5f', '#c2410c', '#b45309', '#be123c', '#4d7c0f', '#7c2d92', '#0e7490']

export function CategoriesManager() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft>({ name: '', description: '', color: COLORS[0] })
  const [editing, setEditing] = useState<{ id: string } & Draft | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api('/api/categories'),
  })

  const create = useMutation({
    mutationFn: () => api('/api/categories', { method: 'POST', body: JSON.stringify(draft) }),
    onSuccess: () => {
      toast.success('Category created.')
      setDraft({ name: '', description: '', color: COLORS[0] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const update = useMutation({
    mutationFn: () =>
      api(`/api/categories/${editing!.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editing!.name, description: editing!.description, color: editing!.color }),
      }),
    onSuccess: () => {
      toast.success('Category updated.')
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Category deleted.')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Organize articles into browsable topics. Shown as filters on the blog.</p>
      </div>

      {/* Create */}
      <Card className="rounded-xl">
        <div className="p-5 space-y-4">
          <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> New category
          </h2>
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Tutorials"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Input
                id="cat-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Short line shown under the name"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2" role="group" aria-label="Category color">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  onClick={() => setDraft({ ...draft, color: c })}
                  className="w-7 h-7 rounded-full grid place-items-center ring-offset-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    boxShadow: draft.color === c ? `0 0 0 2px var(--background), 0 0 0 4px ${c}` : undefined,
                  }}
                >
                  {draft.color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
            <Button
              className="rounded-full gap-2"
              disabled={!draft.name.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add category
            </Button>
          </div>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.categories ?? []).map((c) =>
            editing?.id === c.id ? (
              <Card key={c.id} className="rounded-xl border-primary/40">
                <div className="p-5 space-y-4">
                  <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          aria-label={`Color ${col}`}
                          onClick={() => setEditing({ ...editing, color: col })}
                          className="w-7 h-7 rounded-full grid place-items-center transition-transform hover:scale-110"
                          style={{
                            backgroundColor: col,
                            boxShadow: editing.color === col ? `0 0 0 2px var(--background), 0 0 0 4px ${col}` : undefined,
                          }}
                        >
                          {editing.color === col && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="rounded-full gap-1.5" onClick={() => setEditing(null)}>
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                      <Button size="sm" className="rounded-full gap-1.5" disabled={update.isPending} onClick={() => update.mutate()}>
                        {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={c.id} className="rounded-xl">
                <div className="p-4 md:px-5 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-lg grid place-items-center shrink-0 text-white" style={{ backgroundColor: c.color }}>
                    <FolderOpen className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{c.name}</h3>
                      <Badge variant="secondary" className="font-normal">
                        {c._count?.posts ?? 0} post{(c._count?.posts ?? 0) === 1 ? '' : 's'}
                      </Badge>
                    </div>
                    {c.description && <p className="text-sm text-muted-foreground truncate mt-0.5">{c.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Edit"
                      onClick={() => setEditing({ id: c.id, name: c.name, description: c.description || '', color: c.color })}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => setDeleteId(c.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              Categories with published posts cannot be deleted — reassign those posts first. This action cannot be undone.
            </AlertDialogDescription>
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
