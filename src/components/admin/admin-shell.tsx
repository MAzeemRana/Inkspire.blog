'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  LayoutDashboard, FileText, FolderOpen, MessageSquare, Users, Settings as SettingsIcon,
  LogOut, ExternalLink, Feather, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import { useAdminStore, type AdminTab } from '@/lib/store'
import { navigate } from '@/lib/router'
import { Dashboard } from '@/components/admin/dashboard'
import { PostsManager } from '@/components/admin/posts-manager'
import { PostEditor } from '@/components/admin/post-editor'
import { CategoriesManager } from '@/components/admin/categories-manager'
import { CommentsManager } from '@/components/admin/comments-manager'
import { SubscribersManager } from '@/components/admin/subscribers-manager'
import { SettingsManager } from '@/components/admin/settings-manager'
import { initials } from '@/lib/blog-utils'

const NAV: { tab: AdminTab; label: string; icon: React.ReactNode }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { tab: 'posts', label: 'Posts', icon: <FileText className="w-4 h-4" /> },
  { tab: 'categories', label: 'Categories', icon: <FolderOpen className="w-4 h-4" /> },
  { tab: 'comments', label: 'Comments', icon: <MessageSquare className="w-4 h-4" /> },
  { tab: 'subscribers', label: 'Subscribers', icon: <Users className="w-4 h-4" /> },
  { tab: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
]

interface AdminShellProps {
  user: { id: string; email: string; name: string; avatar?: string }
}

export function AdminShell({ user }: AdminShellProps) {
  const { tab, setTab, openEditor } = useAdminStore()
  const queryClient = useQueryClient()

  const logout = useMutation({
    mutationFn: () => api('/api/auth/login', { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Signed out.')
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })

  const goBlog = () => navigate({ name: 'home' })

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-sidebar">
        <div className="p-4 flex-1">
          <Button
            className="w-full rounded-full gap-2 font-semibold"
            onClick={() => openEditor(null)}
          >
            <Plus className="w-4 h-4" /> New post
          </Button>
          <nav className="mt-5 flex flex-col gap-1" aria-label="Admin navigation">
            {NAV.map((item) => (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  tab === item.tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t space-y-2">
          <Button variant="outline" size="sm" className="w-full rounded-full gap-2" onClick={goBlog}>
            <ExternalLink className="w-3.5 h-3.5" /> View blog
          </Button>
          <div className="flex items-center gap-3 rounded-lg p-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={() => logout.mutate()}
              aria-label="Sign out"
              title="Sign out"
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 bg-background">
        {/* Mobile top bar */}
        <div className="lg:hidden border-b bg-sidebar px-4 py-3 flex items-center gap-3">
          <Feather className="w-5 h-5 text-primary" />
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {NAV.map((item) => (
              <Button
                key={item.tab}
                size="sm"
                variant={tab === item.tab ? 'secondary' : 'ghost'}
                onClick={() => setTab(item.tab)}
                className="rounded-full shrink-0 gap-1.5"
              >
                {item.icon} <span className="hidden sm:inline">{item.label}</span>
              </Button>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="shrink-0" onClick={() => logout.mutate()} aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 md:p-7 max-w-6xl">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'posts' && <PostsManager />}
          {tab === 'editor' && <PostEditor />}
          {tab === 'categories' && <CategoriesManager />}
          {tab === 'comments' && <CommentsManager />}
          {tab === 'subscribers' && <SubscribersManager />}
          {tab === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  )
}
