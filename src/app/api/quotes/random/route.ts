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

  const { data, error } = await supabaseAdmin.from('daily_quotes').select('*')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const quote = data?.[Math.floor(Math.random() * (data.length || 1))] ?? null
  return NextResponse.json(quote)
}
