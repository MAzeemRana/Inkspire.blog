'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { urlToView, viewToUrl, type View } from '@/lib/store'

/**
 * The URL is the single source of truth for the public SPA views.
 * Works inside the single exposed `/` route: every view is a shareable
 * deep link (?post=slug, ?category=slug, ?view=articles|about|admin),
 * and browser back/forward buttons work via popstate.
 */
let listeners: (() => void)[] = []

function subscribe(cb: () => void) {
  listeners.push(cb)
  window.addEventListener('popstate', cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
    window.removeEventListener('popstate', cb)
  }
}

function getSnapshot(): string {
  return window.location.search
}

/** Navigates to a view, updates the URL and scrolls to the top. */
export function navigate(view: View) {
  if (typeof window === 'undefined') return
  const url = viewToUrl(view)
  if (window.location.pathname + window.location.search !== url) {
    window.history.pushState({}, '', url)
  }
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  listeners.forEach((l) => l())
}

/** Current view derived from the URL. SSR-safe (home on the server). */
export function useRouterView(): View {
  const search = useSyncExternalStore(subscribe, getSnapshot, () => '')
  return urlToView(search) || { name: 'home' }
}

export function useNavigate() {
  return useCallback((view: View) => navigate(view), [])
}
