'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Send, MailOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, getErrorMessage } from '@/lib/api-client'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await api<{ message: string }>('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      toast.success(res.message || 'Subscribed! Welcome aboard.')
      setEmail('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14" aria-label="Newsletter signup">
      <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground px-6 py-12 md:p-14 text-center shadow-lg">
        <div className="absolute inset-0 dot-grid opacity-20" aria-hidden="true" />
        <div className="relative max-w-xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium">
            <MailOpen className="w-4 h-4" /> Weekly newsletter
          </span>
          <h2 className="mt-5 font-serif text-3xl md:text-4xl font-bold leading-tight">
            One useful email, every Friday
          </h2>
          <p className="mt-3 text-primary-foreground/85 leading-relaxed">
            Join the inbox crew — the best ideas from the week, one original essay and zero spam. Unsubscribe anytime.
          </p>
          <form onSubmit={subscribe} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-12 rounded-full bg-primary-foreground/95 text-foreground border-0 placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full px-7 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 border-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
