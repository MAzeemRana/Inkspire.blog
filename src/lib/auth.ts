import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db'

const SESSION_COOKIE = 'inkspire_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

// In production, set AUTH_SECRET in your environment (.env on Vercel).
const SECRET = process.env.AUTH_SECRET || 'inkspire-dev-secret-change-me'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

interface SessionPayload {
  uid: string
  email: string
  name: string
  exp: number
}

function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('base64url')
}

export function createToken(payload: Omit<SessionPayload, 'exp'>): string {
  const body: SessionPayload = { ...payload, exp: Date.now() + SESSION_TTL_MS }
  const data = Buffer.from(JSON.stringify(body)).toString('base64url')
  return `${data}.${sign(data)}`
}

export function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token) return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = sign(data)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function getSession() {
  const store = await cookies()
  return verifyToken(store.get(SESSION_COOKIE)?.value)
}

/**
 * Sets the session cookie with flags adapted to the request context:
 * - HTTPS (behind the gateway / production): SameSite=None + Secure, so the
 *   cookie also works inside cross-site iframes (e.g. the preview panel).
 * - Plain HTTP (local dev): SameSite=Lax (SameSite=None requires Secure).
 */
export async function setSessionCookie(payload: Omit<SessionPayload, 'exp'>) {
  const store = await cookies()
  const h = await headers()
  const proto = (h.get('x-forwarded-proto') ?? '').split(',')[0].trim()
  const isHttps = proto === 'https'
  store.set(SESSION_COOKIE, createToken(payload), {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** Returns the authenticated user or null. Validates the session against the DB. */
export async function requireAuth() {
  const session = await getSession()
  if (!session) return null
  const user = await db.user.findUnique({ where: { id: session.uid } })
  return user
}
