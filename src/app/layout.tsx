import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LUVLOG v2',
  description: 'A romantic shared space rebuilt with Next.js App Router',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
