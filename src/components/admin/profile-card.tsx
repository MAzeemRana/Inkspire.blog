'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Loader2, UserRound, KeyRound } from 'lucide-react'
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
  return (
    <div className="space-y-5">
      <ProfileForm key={`${p.name}|${p.avatar ?? ''}|${p.bio ?? ''}`} initial={p} />
      <AccountForm key={`account|${p.email}`} initialEmail={p.email} />
    </div>
  )
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

function AccountForm({ initialEmail }: { initialEmail: string }) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState(initialEmail)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const emailChanged = email.trim().toLowerCase() !== initialEmail.toLowerCase()
  const passwordChanged = newPassword.length > 0

  const saveAccount = useMutation({
    mutationFn: () =>
      api<{ message: string }>('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          ...(emailChanged ? { newEmail: email.trim() } : {}),
          ...(passwordChanged ? { newPassword } : {}),
        }),
      }),
    onSuccess: (res) => {
      toast.success(res.message || 'Sign-in details updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const submitAccount = () => {
    if (!currentPassword) {
      toast.error('Enter your current password to confirm this change.')
      return
    }
    if (emailChanged && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (passwordChanged) {
      if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters.')
        return
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match.')
        return
      }
    }
    if (!emailChanged && !passwordChanged) {
      toast.error('Change your email or type a new password first.')
      return
    }
    saveAccount.mutate()
  }

  return (
    <Card className="rounded-xl">
      <div className="p-5 space-y-5">
        <h2 className="font-serif text-xl font-bold flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" /> Sign-in details
        </h2>
        <p className="text-sm text-muted-foreground">
          Change the email you log in with, or set a new password. Your current password is required to confirm either change.
        </p>
        <div className="space-y-2">
          <Label htmlFor="account-email">Login email</Label>
          <Input
            id="account-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account-current">Current password</Label>
            <Input
              id="account-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-new">New password (leave empty to keep the current one)</Label>
            <Input
              id="account-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        {passwordChanged && (
          <div className="space-y-2">
            <Label htmlFor="account-confirm">Repeat the new password</Label>
            <Input
              id="account-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        )}
        <div className="flex justify-end">
          <Button className="rounded-full gap-2 font-semibold" onClick={submitAccount} disabled={saveAccount.isPending}>
            {saveAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Update sign-in details
          </Button>
        </div>
      </div>
    </Card>
  )
}
