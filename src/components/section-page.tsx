import type { ReactNode } from 'react'

type SectionPageProps = {
  title: string
  description: string
  children?: ReactNode
}

export function SectionPage({ title, description, children }: SectionPageProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-500">LUVLOG V2</p>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </header>
      {children ?? <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">Nội dung đang được migrate từ hệ thống cũ.</div>}
    </section>
  )
}
