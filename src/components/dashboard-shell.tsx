import Link from 'next/link'
import type { ReactNode } from 'react'
import { Home, BookOpen, Images, Wallet, Compass, Film, Settings, MessageSquareText } from 'lucide-react'

const links = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/diary', label: 'Nhật ký', icon: BookOpen },
  { href: '/album', label: 'Album', icon: Images },
  { href: '/budget', label: 'Quỹ chung', icon: Wallet },
  { href: '/activities', label: 'Hoạt động', icon: Compass },
  { href: '/media', label: 'Media', icon: Film },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
]

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f2f8] p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="w-full rounded-3xl border border-[#e9dfe8] bg-white/80 p-5 shadow-sm lg:w-72">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f9dce9] text-2xl">💕</div>
            <div>
              <p className="text-lg font-semibold text-slate-800">LUVLOG</p>
              <p className="text-sm text-slate-500">shared space v2</p>
            </div>
          </div>
          <nav className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-[#f9dce9] hover:text-slate-900">
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl bg-[#fff5f7] p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800"><MessageSquareText size={16} /> Spec mới</div>
            <p className="mt-2">App Router + Tailwind + middleware + route handlers đang được dựng dần.</p>
          </div>
        </aside>
        <main className="flex-1 rounded-3xl border border-[#e9dfe8] bg-white/80 p-5 shadow-sm md:p-8">{children}</main>
      </div>
    </div>
  )
}
