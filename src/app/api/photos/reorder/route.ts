import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthenticatedUser } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }

  const body = await request.json()
  for (const [index, photoId] of body.ordered_photo_ids.entries()) {
    await supabaseAdmin.from('photos').update({ sort_order: index }).eq('id', photoId)
  }

  return NextResponse.json({ ok: true })
}
