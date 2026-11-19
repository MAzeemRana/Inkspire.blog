'use client'

import { useQuery } from '@tanstack/react-query'
import {
  FileText, Eye, MessageSquare, Users, TrendingUp, Loader2, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { useAdminStore } from '@/lib/store'
import { formatViews, formatDate } from '@/lib/blog-utils'
import type { Stats } from '@/lib/types'

export function Dashboard() {
  const { openEditor } = useAdminStore()
  const { data, isLoading } = useQuery<{ stats: Stats }>({
    queryKey: ['stats'],
    queryFn: () => api('/api/stats'),
    refetchInterval: 30 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-52" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  const s = data?.stats
  if (!s) return <p className="text-muted-foreground">Could not load stats.</p>

  const cards = [
    { label: 'Published posts', value: s.publishedPosts, sub: `${s.draftPosts} draft(s)`, icon: <FileText className="w-5 h-5" />, color: 'bg-primary/10 text-primary' },
    { label: 'Total views', value: formatViews(s.totalViews), sub: 'all-time reads', icon: <Eye className="w-5 h-5" />, color: 'bg-chart-2/15 text-chart-2' },
    { label: 'Comments', value: s.approvedComments + s.pendingComments, sub: `${s.pendingComments} awaiting approval`, icon: <MessageSquare className="w-5 h-5" />, color: 'bg-chart-3/15 text-chart-3' },
    { label: 'Subscribers', value: s.subscribers, sub: 'newsletter signups', icon: <Users className="w-5 h-5" />, color: 'bg-chart-5/15 text-chart-5' },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your blog at a glance.</p>
        </div>
        <Button className="rounded-full gap-2" onClick={() => openEditor(null)}>
          <Plus className="w-4 h-4" /> New post
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{c.label}</p>
                  <p className="mt-2 text-3xl font-bold font-serif">{c.value}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{c.sub}</p>
                </div>
                <span className={`w-10 h-10 rounded-lg grid place-items-center ${c.color}`}>{c.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent posts */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg">Recent posts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {s.recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No posts yet. Create your first one!</p>
            ) : (
              <div className="divide-y">
                {s.recentPosts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(p.createdAt)} · {formatViews(p.views)} views
                      </p>
                    </div>
                    {p.published ? (
                      <Badge className="bg-primary/10 text-primary border-0 shrink-0" variant="outline">Live</Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">Draft</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top posts */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Most read
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {s.topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Publish posts to start collecting views.</p>
            ) : (
              <div className="divide-y">
                {s.topPosts.map((p, i) => (
                  <div key={p.id} className="py-3 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-bold grid place-items-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium truncate flex-1">{p.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{formatViews(p.views)} views</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
