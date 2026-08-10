import Link from 'next/link'

export default function HomePage() {
  const cards = [
    ['905', 'ngày bên nhau'],
    ['2', 'người cùng chia sẻ'],
    ['6', 'module nghiệp vụ đã có nền'],
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-500">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">LUVLOG v2</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Nền tảng đang được chuyển dần sang Next.js App Router + Supabase Auth + Tailwind theo spec mới.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">
            Đăng nhập
          </Link>
          <Link href="/diary" className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700">
            Vào nhật ký
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(([value, label]) => (
          <div key={label} className="rounded-3xl border border-[#e9dfe8] bg-white p-6 shadow-sm">
            <div className="text-3xl font-semibold text-slate-900">{value}</div>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
