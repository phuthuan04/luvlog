import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-3xl border border-[#e9dfe8] bg-white p-8 shadow-sm">
        <p className="text-center text-3xl">💕</p>
        <h1 className="mt-4 text-center text-3xl font-semibold text-slate-900">Đăng nhập</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Dùng Supabase Auth theo spec mới.</p>
        <LoginForm />
      </div>
    </div>
  )
}
