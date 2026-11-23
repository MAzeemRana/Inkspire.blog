import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, setSessionCookie } from '@/lib/auth'

/** Public-safe shape of the admin profile (never exposes the password hash). */
function toProfile(user: {
  id: string
  email: string
  name: string
  avatar: string | null
  bio: string | null
}) {
  return { id: user.id, email: user.email, name: user.name, avatar: user.avatar, bio: user.bio }
}

export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ profile: toProfile(auth) })
  } catch (e) {
    console.error('[profile:GET]', e)
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json()) as {
      name?: string
      avatar?: string
      bio?: string
    }

    const name = (body.name ?? '').trim()
    const avatar = (body.avatar ?? '').trim()
    const bio = (body.bio ?? '').trim()

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }
    if (avatar && !/^(https?:\/\/|\/)/i.test(avatar)) {
      return NextResponse.json(
        { error: 'Photo must be a URL (https://…) or a site path (/photo.jpg).' },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id: auth.id },
      data: { name, avatar: avatar || null, bio: bio || null },
    })

    // Re-issue the session cookie so the admin header shows the new identity
    // immediately, without forcing a logout/login.
    await setSessionCookie({ uid: user.id, email: user.email, name: user.name })

    return NextResponse.json({ profile: toProfile(user), message: 'Profile updated.' })
  } catch (e) {
    console.error('[profile:PATCH]', e)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}
