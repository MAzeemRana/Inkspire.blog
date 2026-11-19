'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Feather, Lock, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { api, getErrorMessage } from '@/lib/api-client'
import { AdminShell } from '@/components/admin/admin-shell'

export function AdminView() {
  const { data, isLoading } = useQuery<{ user: { id: string; email: string; name: string; avatar?: string } | null }>({
    queryKey: ['auth'],
    queryFn: () => api('/api/auth/me'),
    staleTime: 60 * 1000,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return data?.user ? <AdminShell user={data.user} /> : <LoginForm />
}

function LoginForm() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useMutation({
    mutationFn: () =>
      api<{ user: { id: string; email: string; name: string; avatar?: string } | null }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: (res) => {
      // Seed the auth cache directly from the login response so the dashboard
      // renders immediately — no dependence on a follow-up /api/auth/me round-trip.
      queryClient.setQueryData(['auth'], { user: res.user })
      toast.success('Welcome back!')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="text-center">
        <span className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center shadow-md">
          <Feather className="w-7 h-7" />
        </span>
        <h1 className="mt-5 font-serif text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage posts, comments and subscribers.</p>
      </div>

      <form
        className="mt-8 rounded-2xl border bg-card p-6 md:p-7 space-y-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          login.mutate()
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            required
            placeholder="admin@inkspire.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" disabled={login.isPending} className="w-full h-11 rounded-full font-semibold gap-2">
          {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Sign in
        </Button>
      </form>

      <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Demo credentials</p>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs leading-relaxed">
            admin@inkspire.io<br />
            inkspire2026
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Change the password after first login in Settings. For production, create a fresh admin and delete this one.
          </p>
        </div>
      </div>
    </div>
  )
}
