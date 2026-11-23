import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSessionCookie } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })
  const user = await db.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, name: true, avatar: true, bio: true, role: true },
  })
  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
      where: { id: session.uid },
      data: { name, avatar: avatar || null, bio: bio || null },
    })

    // Re-issue the session cookie so the admin header shows the new identity
    // immediately, without forcing a logout/login.
    await setSessionCookie({ uid: user.id, email: user.email, name: user.name })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, bio: user.bio },
      message: 'Profile updated.',
    })
  } catch (e) {
    console.error('[me:PATCH]', e)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}
