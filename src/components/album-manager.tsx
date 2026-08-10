"use client"

import { useEffect, useMemo, useState, type FormEvent } from 'react'

type Album = {
  id: number
  name: string
  photo_count?: number
  created_at?: string
}

type Photo = {
  id: number
  album_id: number | null
  album_name?: string
  url: string
  filename?: string
  caption?: string
  created_at?: string
}

export function AlbumManager() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadData() {
    setError('')
    const [albumRes, photoRes] = await Promise.all([
      fetch('/api/albums'),
      fetch('/api/photos'),
    ])

    if (!albumRes.ok) {
      setError('Không tải được album')
      return
    }
    if (!photoRes.ok) {
      setError('Không tải được danh sách ảnh')
      return
    }

    const albumData = await albumRes.json()
    const photoData = await photoRes.json()
    setAlbums(albumData)
    setPhotos(photoData)

    if (!selectedAlbumId && albumData.length > 0) {
      setSelectedAlbumId(String(albumData[0].id))
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const selectedAlbumLabel = useMemo(() => {
    const found = albums.find((item) => String(item.id) === selectedAlbumId)
    return found ? found.name : 'Chọn album'
  }, [albums, selectedAlbumId])

  async function createAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!albumName.trim()) return

    const res = await fetch('/api/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: albumName.trim() }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Không tạo được album')
      return
    }

    setAlbumName('')
    setMessage('Đã tạo album mới')
    await loadData()
  }

  async function uploadPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const file = formData.get('file')

    if (!(file instanceof File)) {
      setError('Vui lòng chọn file ảnh')
      return
    }

    if (!selectedAlbumId) {
      setError('Vui lòng chọn album')
      return
    }

    const payload = new FormData()
    payload.append('album_id', selectedAlbumId)
    payload.append('file', file)
    payload.append('caption', String(formData.get('caption') ?? ''))

    const res = await fetch('/api/photos', {
      method: 'POST',
      body: payload,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Không upload được ảnh')
      return
    }

    event.currentTarget.reset()
    setMessage('Upload ảnh thành công')
    await loadData()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={createAlbum} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tạo album</h2>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="Tên album"
          />
          <button className="rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white" type="submit">
            Tạo album
          </button>
        </form>

        <form onSubmit={uploadPhoto} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upload ảnh</h2>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
          >
            <option value="">Chọn album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" name="caption" placeholder="Ghi chú ảnh (tuỳ chọn)" />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" name="file" type="file" accept="image/*" />
          <button className="rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white" type="submit">
            Upload ảnh
          </button>
        </form>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Danh sách album</h2>
          <span className="text-sm text-slate-500">Đang chọn: {selectedAlbumLabel}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => setSelectedAlbumId(String(album.id))}
              className={`rounded-3xl border p-4 text-left shadow-sm transition ${String(album.id) === selectedAlbumId ? 'border-pink-400 bg-pink-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="font-semibold text-slate-900">{album.name}</div>
              <div className="text-sm text-slate-500">{album.photo_count ?? 0} ảnh</div>
            </button>
          ))}
          {!albums.length ? <p className="text-sm text-slate-500">Chưa có album nào.</p> : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Ảnh gần đây</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img src={photo.url} alt={photo.caption ?? photo.filename ?? 'album photo'} className="h-56 w-full object-cover" />
              <figcaption className="space-y-1 p-4 text-sm text-slate-600">
                <div className="font-medium text-slate-900">{photo.filename ?? 'Ảnh'}</div>
                <div>{photo.caption || 'Không có ghi chú'}</div>
              </figcaption>
            </figure>
          ))}
          {!photos.length ? <p className="text-sm text-slate-500">Chưa có ảnh nào.</p> : null}
        </div>
      </section>
    </div>
  )
}
