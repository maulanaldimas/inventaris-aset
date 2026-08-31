import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'

export const SESSION_COOKIE = 'inventaris_session'
const SESSION_DURATION = '8h'

function secretKey() {
    return new TextEncoder().encode(
        process.env.SESSION_SECRET || 'insecure-dev-secret'
    )
}

export async function createSessionToken(user) {
    return new SignJWT({
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(SESSION_DURATION)
        .sign(secretKey())
}

export async function verifySessionToken(token) {
    try {
        const { payload } = await jwtVerify(token, secretKey())
        return payload
    } catch {
        return null
    }
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null
    return verifySessionToken(token)
}

export async function requireSession() {
    const session = await getSession()
    if (!session) throw new AuthError('Tidak terautentikasi')
    return session
}

export async function requireAdmin() {
    const session = await requireSession()
    if (session.role !== 'admin') throw new AuthError('Hanya admin yang dapat melakukan aksi ini', 403)
    return session
}

export class AuthError extends Error {
    constructor(message, status = 401) {
        super(message)
        this.status = status
    }
}

export async function getCurrentUser() {
    const session = await getSession()
    if (!session) return null
    const user = await db.profile.findUnique({
        where: { id: session.sub },
        include: { company: true },
    })
    return user
}

export function sessionCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
    }
}
