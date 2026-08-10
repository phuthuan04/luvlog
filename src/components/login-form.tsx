"use client"

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Thiếu cấu hình Supabase public env.')
      return
    }

    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" type="email" name="email" placeholder="Email" required />
      <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" type="password" name="password" placeholder="Mật khẩu" required />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button className="w-full rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white" type="submit">
        Đăng nhập
      </button>
    </form>
  )
}
