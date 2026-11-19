import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSessionCookie, clearSessionCookie } from '@/lib/auth'
import { ensureSeed } from '@/lib/seed'

export async function POST(req: NextRequest) {
  try {
    await ensureSeed()
    const { email, password } = (await req.json()) as { email?: string; password?: string }
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }
    await setSessionCookie({ uid: user.id, email: user.email, name: user.name })
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } })
  } catch (e) {
    console.error('[login]', e)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}

export async function DELETE() {
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
