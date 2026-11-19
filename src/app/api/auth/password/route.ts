import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, hashPassword, verifyPassword } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both fields are required.' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
    }
    if (!verifyPassword(currentPassword, auth.password)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }
    await db.user.update({ where: { id: auth.id }, data: { password: hashPassword(newPassword) } })
    return NextResponse.json({ message: 'Password updated successfully.' })
  } catch (e) {
    console.error('[password:PATCH]', e)
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 })
  }
}
