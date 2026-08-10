import { AlbumManager } from '@/components/album-manager'

export default function AlbumPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-500">LUVLOG V2</p>
        <h1 className="text-3xl font-semibold text-slate-900">Album</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Album ảnh đang dùng Google Drive upload pipeline. Bạn có thể tạo album mới và upload ảnh ngay ở đây để test.
        </p>
      </header>
      <AlbumManager />
    </div>
  )
}
