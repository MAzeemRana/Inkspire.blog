'use client'

// Admin section tabs (opening admin always lands on the dashboard)
export type AdminTab =
  | 'dashboard'
  | 'posts'
  | 'editor'
  | 'categories'
  | 'comments'
  | 'subscribers'
  | 'settings'

interface AdminState {
  tab: AdminTab
  editingPostId: string | null
  setTab: (tab: AdminTab) => void
  openEditor: (postId: string | null) => void
}

import { create } from 'zustand'

export const useAdminStore = create<AdminState>((set) => ({
  tab: 'dashboard',
  editingPostId: null,
  setTab: (tab) => set({ tab }),
  openEditor: (postId) => set({ tab: 'editor', editingPostId: postId }),
}))

export type View =
  | { name: 'home' }
  | { name: 'articles' }
  | { name: 'post'; postId: string; slug?: string }
  | { name: 'category'; categoryId: string; slug?: string }
  | { name: 'about' }
  | { name: 'admin' }

export function viewToUrl(view: View): string {
  switch (view.name) {
    case 'articles':
      return '/?view=articles'
    case 'about':
      return '/?view=about'
    case 'admin':
      return '/?view=admin'
    case 'post':
      return `/?post=${encodeURIComponent(view.slug || view.postId)}`
    case 'category':
      return `/?category=${encodeURIComponent(view.slug || view.categoryId)}`
    default:
      return '/'
  }
}

/** Parses ?post= / ?view= / ?category= URLs into views (deep links, shared URLs). */
export function urlToView(search: string): View | null {
  const sp = new URLSearchParams(search)
  const post = sp.get('post')
  const category = sp.get('category')
  const view = sp.get('view')
  if (post) return { name: 'post', postId: post, slug: post }
  if (category) return { name: 'category', categoryId: category, slug: category }
  if (view === 'articles') return { name: 'articles' }
  if (view === 'about') return { name: 'about' }
  if (view === 'admin') return { name: 'admin' }
  return null
}
