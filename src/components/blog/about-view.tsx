'use client'

import { useQuery } from '@tanstack/react-query'
import { Feather, Target, PenLine, ShieldCheck, Twitter, Github, Linkedin, Mail, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Newsletter } from '@/components/blog/newsletter'
import { api } from '@/lib/api-client'
import { useNavigate } from '@/lib/router'
import { initials } from '@/lib/blog-utils'
import type { Settings } from '@/lib/types'

export function AboutView() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery<{ settings: Settings }>({
    queryKey: ['settings'],
    queryFn: () => api('/api/settings'),
  })

  const s = data?.settings
  const paragraphs = (s?.aboutText || '').split('\n').filter(Boolean)

  const values = [
    { icon: <Target className="w-5 h-5" />, title: 'First-hand, always', text: 'Every claim comes from a real project — real numbers, real screenshots, real mistakes.' },
    { icon: <PenLine className="w-5 h-5" />, title: 'Depth over volume', text: 'One thoughtful essay per week beats daily filler. Quality is the only growth strategy here.' },
    { icon: <ShieldCheck className="w-5 h-5" />, title: 'No pay-to-play', text: 'Recommendations are earned by use, never bought. Sponsored content is labeled, if it ever appears.' },
  ]

  return (
    <>
      <section className="border-b bg-gradient-to-b from-accent/50 to-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-16 text-center">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center shadow-md">
            <Feather className="w-7 h-7" />
          </span>
          <h1 className="mt-6 font-serif text-4xl md:text-5xl font-bold">{s?.aboutTitle || 'About Inkspire'}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{s?.tagline || 'Stories, ideas & insights worth sharing.'}</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="article-body text-foreground/90">
            {paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
        )}

        {/* Author card */}
        <div className="mt-10 rounded-2xl border bg-card p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <Avatar className="w-16 h-16 shrink-0">
            <AvatarImage src="/azeem.jpg" alt="Muhammad Azeem " />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">AC</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-serif text-xl font-bold">Muhammad Azeem </p>
            <p className="text-sm text-muted-foreground mt-1">Writer &amp; developer behind {s?.siteName || 'Inkspire'}</p>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
              I build things for the web and write about the process — the wins, the failures and everything in between.
            </p>
            <div className="mt-3 flex gap-2">
              {[
                { href: s?.twitter, icon: <Twitter className="w-4 h-4" />, label: 'Twitter' },
                { href: s?.github, icon: <Github className="w-4 h-4" />, label: 'GitHub' },
                { href: s?.linkedin, icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' },
                { href: s?.contactEmail ? `mailto:${s.contactEmail}` : undefined, icon: <Mail className="w-4 h-4" />, label: 'Email' },
              ]
                .filter((x) => x.href)
                .map((x) => (
                  <a
                    key={x.label}
                    href={x.href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={x.label}
                    className="w-9 h-9 rounded-full border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                  >
                    {x.icon}
                  </a>
                ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-12">
          <h2 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> What this blog stands for
          </h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-card p-5">
                <span className="inline-flex w-10 h-10 rounded-xl bg-primary/10 text-primary items-center justify-center">
                  {v.icon}
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">Want to see what I write about?</p>
          <button
            onClick={() => navigate({ name: 'articles' })}
            className="mt-2 font-serif text-xl font-bold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            Browse all articles
          </button>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
