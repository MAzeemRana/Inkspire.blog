'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Loader2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { api, getErrorMessage } from '@/lib/api-client'

interface Profile {
  id: string
  email: string
  name: string
  avatar: string | null
  bio: string | null
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ProfileCard() {
  const { data, isLoading } = useQuery<{ user: Profile }>({
    queryKey: ['profile'],
    queryFn: () => api('/api/auth/me'),
  })

  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <div className="p-5 space-y-5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    )
  }
  if (!data?.user) {
    return <p className="text-muted-foreground">Could not load profile.</p>
  }

  const p = data.user
  return <ProfileForm key={`${p.name}|${p.avatar ?? ''}|${p.bio ?? ''}`} initial={p} />
}

function ProfileForm({ initial }: { initial: Profile }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: initial.name,
    avatar: initial.avatar ?? '',
    bio: initial.bio ?? '',
  })

  const save = useMutation({
    mutationFn: () => api('/api/auth/me', { method: 'PATCH', body: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success('Profile updated. Every article now shows your new name and photo.')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const set =
    (key: 'name' | 'avatar' | 'bio') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <Card className="rounded-xl">
      <div className="p-5 space-y-5">
        <h2 className="font-serif text-xl font-bold flex items-center gap-2">
          <UserRound className="w-5 h-5 text-primary" /> Author profile
        </h2>
        <p className="text-sm text-muted-foreground">
          Shown on every article byline, the author card, the homepage and your About page.
        </p>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 shrink-0">
            <AvatarImage src={form.avatar || undefined} alt={form.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initialsOf(form.name) || 'AD'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label htmlFor="profile-name">Author name</Label>
            <Input id="profile-name" value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-avatar">Author photo (URL or /photo.jpg from your public folder)</Label>
          <Input id="profile-avatar" value={form.avatar} onChange={set('avatar')} placeholder="/azeem.jpg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-bio">Author bio (shown in the &ldquo;Written by&rdquo; card)</Label>
          <Textarea id="profile-bio" value={form.bio} onChange={set('bio')} rows={3} />
        </div>
        <div className="flex justify-end">
          <Button
            className="rounded-full gap-2 font-semibold"
            onClick={() => save.mutate()}
            disabled={save.isPending || !form.name.trim()}
          >
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save profile
          </Button>
        </div>
      </div>
    </Card>
  )
}
