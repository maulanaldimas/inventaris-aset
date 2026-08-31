import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { db } from '../../../../lib/db'
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '../../../../lib/auth'
import { jsonError } from '../../../../lib/http'

export async function POST(request) {
    try {
        const { email, password } = await request.json()
        if (!email || !password) {
            return Response.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
        }

        const user = await db.profile.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: { company: true },
        })

        const valid = user && (await bcrypt.compare(password, user.passwordHash))
        if (!valid) {
            return Response.json({ error: 'Email atau password salah' }, { status: 401 })
        }

        const token = await createSessionToken(user)
        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions())

        return Response.json({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.fullName,
                role: user.role,
                company_id: user.companyId,
            },
        })
    } catch (error) {
        return jsonError(error)
    }
}
