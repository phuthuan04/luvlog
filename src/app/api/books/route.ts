import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { createMedia, listMedia, requireMediaTable } from '@/lib/supabase/media'

const table = requireMediaTable('books')

export async function GET() {
  const { user } = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    return NextResponse.json(await listMedia(table!))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    return NextResponse.json(await createMedia(table!, {
      title: body.title,
      cover_url: body.cover_url ?? '',
      external_id: body.external_id ?? '',
      category: body.category ?? '',
      status: body.status ?? 'muon',
      rating: body.rating ?? null,
      review: body.review ?? '',
      added_by: user.email ?? user.id,
      experienced_at: body.experienced_at ?? null,
    }))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
