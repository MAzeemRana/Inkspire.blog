'use client'

import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/blog/header'
import { Footer } from '@/components/blog/footer'
import { HomeView } from '@/components/blog/home-view'
import { ArticlesView } from '@/components/blog/articles-view'
import { PostView } from '@/components/blog/post-view'
import { AboutView } from '@/components/blog/about-view'
import { AdminView } from '@/components/admin/admin-view'
import { useRouterView } from '@/lib/router'
import { api } from '@/lib/api-client'
import type { Settings, Category } from '@/lib/types'

/**
 * Inkspire — single-page application shell.
 * Views derive from the URL (?post=slug, ?category=slug, ?view=…),
 * so every screen is a shareable deep link and back/forward work.
 */
export function BlogApp() {
  const view = useRouterView()

  const { data: settingsData } = useQuery<{ settings: Settings }>({
    queryKey: ['settings'],
    queryFn: () => api('/api/settings'),
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header settings={settingsData?.settings} />
      <main className="flex-1">
        {view.name === 'home' && <HomeView />}
        {view.name === 'articles' && <ArticlesView />}
        {view.name === 'post' && <PostView key={view.postId} postId={view.postId} />}
        {view.name === 'category' && <CategoryView key={view.categoryId} identifier={view.categoryId} />}
        {view.name === 'about' && <AboutView />}
        {view.name === 'admin' && <AdminView />}
      </main>
      <Footer settings={settingsData?.settings} />
    </div>
  )
}

function CategoryView({ identifier }: { identifier: string }) {
  const { data, isLoading } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api('/api/categories'),
  })
  const category = data?.categories.find((c) => c.id === identifier || c.slug === identifier)

  if (isLoading) return <ArticlesView />
  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="font-serif text-2xl font-bold">Category not found</p>
        <p className="mt-2 text-muted-foreground">Browse all articles instead.</p>
      </div>
    )
  }
  return <ArticlesView key={category.id} presetCategory={category.id} />
}
