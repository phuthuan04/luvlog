import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { uploadImageToDrive } from '@/lib/google-drive'

export const runtime = 'nodejs'

export async function GET() {
  const { user } = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin.from('photos').select('*').order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  let albumId: string | null = null
  let caption = ''
  let filename = 'uploaded-image'
  let fileSize = 0
  let driveFileId = ''
  let url = ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file upload' }, { status: 400 })
    }

    const albumIdValue = formData.get('album_id')
    if (typeof albumIdValue !== 'string' || !albumIdValue.trim()) {
      return NextResponse.json({ error: 'Missing album_id' }, { status: 400 })
    }
    albumId = albumIdValue

    caption = String(formData.get('caption') ?? '')
    filename = file.name || filename
    fileSize = file.size

    const upload = await uploadImageToDrive(file)
    driveFileId = upload.driveFileId
    url = upload.publicUrl
  } else {
    const body = await request.json()
    albumId = body.album_id != null ? String(body.album_id) : null
    caption = body.caption ?? ''
    filename = body.filename ?? filename
    fileSize = body.file_size ?? 0
    driveFileId = body.drive_file_id ?? ''
    url = body.url ?? (driveFileId ? `https://lh3.googleusercontent.com/d/${driveFileId}` : '')
  }

  const { data, error } = await supabaseAdmin.from('photos').insert({
    album_id: albumId ? Number(albumId) : null,
    url,
    drive_file_id: driveFileId,
    filename,
    file_size: fileSize,
    caption,
    uploaded_by: user.email ?? user.id,
  }).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
