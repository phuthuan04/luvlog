import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths = ['/', '/diary', '/album', '/budget', '/activities', '/media', '/settings']
const allowedUserIds = (process.env.SUPABASE_ALLOWED_USER_IDS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const pathname = request.nextUrl.pathname

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  const isProtected = protectedPaths.includes(pathname) || pathname.startsWith('/api')
  const userId = user?.id?.toLowerCase() ?? ''
  const isAllowedUser = allowedUserIds.length > 0 && userId ? allowedUserIds.includes(userId) : false

  if (pathname === '/login') {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  if (isProtected && (!user || !isAllowedUser)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
