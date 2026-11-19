'use client'

import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download, Mail, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { api } from '@/lib/api-client'
import { formatDate } from '@/lib/blog-utils'

interface SubscriberRow {
  id: string
  email: string
  createdAt: string
}

export function SubscribersManager() {
  const { data, isLoading } = useQuery<{ subscribers: SubscriberRow[] }>({
    queryKey: ['subscribers'],
    queryFn: () => api('/api/subscribers'),
  })

  const subscribers = data?.subscribers ?? []

  const exportCsv = () => {
    const rows = [['email', 'subscribed_at'], ...subscribers.map((s) => [s.email, s.createdAt])]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inkspire-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${subscribers.length} subscribers to CSV.`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Subscribers</h1>
          <p className="text-sm text-muted-foreground mt-1">Everyone who signed up for the newsletter from the blog.</p>
        </div>
        <Button
          variant="outline"
          className="rounded-full gap-2"
          onClick={exportCsv}
          disabled={subscribers.length === 0}
        >
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Card className="rounded-xl">
        <div className="p-6 border-b flex items-center gap-4">
          <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Users className="w-6 h-6" />
          </span>
          <div>
            <p className="font-serif text-4xl font-bold tabular-nums">{isLoading ? '…' : subscribers.length}</p>
            <p className="text-sm text-muted-foreground">total subscribers</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-14 text-center">
            <Mail className="w-9 h-9 mx-auto text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No subscribers yet — the signup form is on every page.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y">
            {subscribers.map((s) => (
              <div key={s.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium truncate">{s.email}</span>
                <span className="text-xs text-muted-foreground shrink-0">{formatDate(s.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
