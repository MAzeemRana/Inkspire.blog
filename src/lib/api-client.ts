'use client'

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Something went wrong. Please try again.')
  }
  return data as T
}

export interface ApiError {
  message: string
}

export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  return 'Something went wrong. Please try again.'
}
