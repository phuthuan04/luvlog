import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthenticatedUser } from '@/lib/supabase/server'

export async function GET() {
  const { user } = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin.from('settings').select('*')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const payload = Object.fromEntries((data ?? []).map((item: any) => [item.key, item.value]))
  return NextResponse.json(payload)
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }

  const body = await request.json()
  for (const [key, value] of Object.entries(body)) {
    await supabaseAdmin.from('settings').upsert({ key, value: String(value) })
  }

  return NextResponse.json({ ok: true })
}
