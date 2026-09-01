import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'inventaris_session'
const BASE_PATH = process.env.APP_BASE_PATH || ''

async function getSessionUser(request) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!token) return null
    try {
        const secret = new TextEncoder().encode(
            process.env.SESSION_SECRET || 'insecure-dev-secret'
        )
        const { payload } = await jwtVerify(token, secret)
        return payload
    } catch {
        return null
    }
}

export async function proxy(request) {
  const user = await getSessionUser(request)
  const { pathname } = request.nextUrl
  const isHalamanPublik = pathname.startsWith('/login') || pathname.startsWith('/scan')
  if (!user && !isHalamanPublik) return NextResponse.redirect(new URL(`${BASE_PATH}/login`, request.url))
  if (user && pathname.startsWith('/login')) return NextResponse.redirect(new URL(`${BASE_PATH}/dashboard`, request.url))
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|api).*)'] }
