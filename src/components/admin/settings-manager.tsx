'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Loader2, Globe, Search, KeyRound, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { api, getErrorMessage } from '@/lib/api-client'
import { ProfileCard } from './profile-card'
import type { Settings } from '@/lib/types'

interface FormState {
  siteName: string
  tagline: string
  aboutTitle: string
  aboutText: string
  twitter: string
  github: string
  linkedin: string
  contactEmail: string
  metaKeywords: string
  metaDescription: string
}

function buildForm(s: Settings): FormState {
  return {
    siteName: s.siteName || '',
    tagline: s.tagline || '',
    aboutTitle: s.aboutTitle || '',
    aboutText: s.aboutText || '',
    twitter: s.twitter || '',
    github: s.github || '',
    linkedin: s.linkedin || '',
    contactEmail: s.contactEmail || '',
    metaKeywords: s.metaKeywords || '',
    metaDescription: s.metaDescription || '',
  }
}

export function SettingsManager() {
  const { data, isLoading } = useQuery<{ settings: Settings }>({
    queryKey: ['settings'],
    queryFn: () => api('/api/settings'),
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-5">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (!data?.settings) {
    return <p className="text-muted-foreground">Could not load settings.</p>
  }

  // key remounts the form with fresh state whenever settings change
  return <SettingsForm key={data.settings.updatedAt} initial={data.settings} />
}

function SettingsForm({ initial }: { initial: Settings }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => buildForm(initial))
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' })

  const save = useMutation({
    mutationFn: () => api('/api/settings', { method: 'PATCH', body: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success('Settings saved. Public pages reflect the change immediately.')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const changePassword = useMutation({
    mutationFn: () => api('/api/auth/password', { method: 'PATCH', body: JSON.stringify(pw) }),
    onSuccess: () => {
      toast.success('Password updated successfully.')
      setPw({ currentPassword: '', newPassword: '' })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Site identity, SEO defaults, social links and admin security.</p>
      </div>
            <ProfileCard />

      {/* Site identity */}
      <Card className="rounded-xl">
        <div className="p-5 space-y-5">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Site identity
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="set-name">Site name</Label>
              <Input id="set-name" value={form.siteName} onChange={set('siteName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-tagline">Tagline</Label>
              <Input id="set-tagline" value={form.tagline} onChange={set('tagline')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="set-about-title">About page title</Label>
            <Input id="set-about-title" value={form.aboutTitle} onChange={set('aboutTitle')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="set-about">About page text (blank line between paragraphs)</Label>
            <Textarea id="set-about" value={form.aboutText} onChange={set('aboutText')} rows={7} />
          </div>
        </div>
      </Card>

      {/* SEO */}
      <Card className="rounded-xl">
        <div className="p-5 space-y-5">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> SEO defaults &amp; Google indexing
          </h2>
          <div className="space-y-2">
            <Label htmlFor="set-meta-desc">Default meta description (homepage)</Label>
            <Textarea id="set-meta-desc" value={form.metaDescription} onChange={set('metaDescription')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="set-meta-kw">Default keywords</Label>
            <Input id="set-meta-kw" value={form.metaKeywords} onChange={set('metaKeywords')} />
          </div>
          <div className="rounded-xl border bg-muted/40 p-4 text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" /> How Google indexing works here
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1.5 text-[0.9rem] leading-relaxed">
              <li><strong className="text-foreground">sitemap.xml</strong> regenerates automatically with every published post.</li>
              <li><strong className="text-foreground">robots.txt</strong> allows all crawlers and points to the sitemap.</li>
              <li>Every article emits <strong className="text-foreground">JSON-LD (BlogPosting)</strong> structured data and per-post meta/Open Graph tags.</li>
              <li>Deployed live, submit <code className="font-mono text-xs bg-secondary px-1 py-0.5 rounded">https://yourdomain.com/sitemap.xml</code> in Google Search Console once — new posts are picked up automatically.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Social */}
      <Card className="rounded-xl">
        <div className="p-5 space-y-5">
          <h2 className="font-serif text-xl font-bold">Social links</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="set-twitter">Twitter / X URL</Label>
              <Input id="set-twitter" value={form.twitter} onChange={set('twitter')} placeholder="https://twitter.com/…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-github">GitHub URL</Label>
              <Input id="set-github" value={form.github} onChange={set('github')} placeholder="https://github.com/…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-linkedin">LinkedIn URL</Label>
              <Input id="set-linkedin" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-email">Contact email</Label>
              <Input id="set-email" type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="hello@yourdomain.com" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="rounded-full gap-2 font-semibold" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save settings
        </Button>
      </div>

      {/* Password */}
      <Card className="rounded-xl">
        <div className="p-5 space-y-5">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Change admin password
          </h2>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pw-current">Current password</Label>
              <Input
                id="pw-current"
                type="password"
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-new">New password (min. 8 characters)</Label>
              <Input
                id="pw-new"
                type="password"
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              disabled={changePassword.isPending || !pw.currentPassword || pw.newPassword.length < 8}
              onClick={() => changePassword.mutate()}
            >
              {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Update password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
