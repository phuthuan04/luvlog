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

  const [{ data: goals }, { data: transactions }] = await Promise.all([
    supabaseAdmin.from('fund_goals').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('fund_transactions').select('*').order('created_at', { ascending: false }),
  ])

  const balance = (transactions ?? []).reduce((sum: number, item: any) => sum + (item.amount ?? 0), 0)

  return NextResponse.json({ goals: goals ?? [], transactions: transactions ?? [], balance })
}
