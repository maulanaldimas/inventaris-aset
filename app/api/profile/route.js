import { db } from '../../../lib/db'
import { requireSession } from '../../../lib/auth'
import { jsonError } from '../../../lib/http'

export async function PUT(request) {
    try {
        const session = await requireSession()
        const body = await request.json()

        if (!body.full_name?.trim()) {
            return Response.json({ error: 'Nama lengkap wajib diisi' }, { status: 400 })
        }

        await db.profile.update({
            where: { id: session.sub },
            data: {
                fullName: body.full_name.trim(),
                phone: body.phone || null,
                jobTitle: body.job_title || null,
                avatarUrl: body.avatar_url ?? undefined,
            },
        })

        return Response.json({ ok: true })
    } catch (error) {
        return jsonError(error)
    }
}
