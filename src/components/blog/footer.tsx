'use client'

import { Feather, Twitter, Github, Linkedin, Mail, Rss } from 'lucide-react'
import { useNavigate } from '@/lib/router'
import type { Settings } from '@/lib/types'

export function Footer({ settings }: { settings?: Settings }) {
  const navigate = useNavigate()
  const siteName = settings?.siteName || 'Inkspire'
  const socials = [
    { href: settings?.twitter, icon: <Twitter className="w-4 h-4" />, label: 'Twitter' },
    { href: settings?.github, icon: <Github className="w-4 h-4" />, label: 'GitHub' },
    { href: settings?.linkedin, icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' },
    { href: settings?.contactEmail ? `mailto:${settings.contactEmail}` : undefined, icon: <Mail className="w-4 h-4" />, label: 'Email' },
  ].filter((s) => s.href)

  return (
    <footer className="mt-auto border-t bg-secondary/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <Feather className="w-4 h-4" />
              </span>
              <span className="font-serif text-xl font-bold">{siteName}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {settings?.tagline || 'Stories, ideas & insights worth sharing.'}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
              <a
                href="/rss.xml"
                aria-label="RSS feed"
                className="w-8 h-8 rounded-full border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Rss className="w-4 h-4" />
              </a>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" aria-label="Footer navigation">
            <button className="text-muted-foreground hover:text-foreground transition-colors text-left" onClick={() => navigate({ name: 'home' })}>
              Home
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors text-left" onClick={() => navigate({ name: 'articles' })}>
              All Articles
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors text-left" onClick={() => navigate({ name: 'about' })}>
              About
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors text-left" onClick={() => navigate({ name: 'admin' })}>
              Admin
            </button>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p>Built with Next.js · Deployed on Vercel · Indexed by Google</p>
        </div>
      </div>
    </footer>
  )
}
