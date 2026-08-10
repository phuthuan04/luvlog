import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { deleteMedia, updateMedia, requireMediaTable } from '@/lib/supabase/media'

const table = requireMediaTable('books')

export async function PATCH(request: Request, { params }: { params: { itemId: string } }) {
  const { user } = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    return NextResponse.json(await updateMedia(table!, params.itemId, body))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
  const { user } = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await deleteMedia(table!, params.itemId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
