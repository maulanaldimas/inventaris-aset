import { db } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'
import { jsonError } from '../../../lib/http'

export async function PUT(request) {
    try {
        const session = await requireAdmin()
        if (!session.companyId) {
            return Response.json({ error: 'Perusahaan belum diatur' }, { status: 400 })
        }

        const body = await request.json()
        if (!body.name?.trim()) {
            return Response.json({ error: 'Nama perusahaan wajib diisi' }, { status: 400 })
        }

        await db.company.update({
            where: { id: session.companyId },
            data: {
                name: body.name.trim(),
                logoUrl: body.logo_url ?? undefined,
                primaryColor: body.primary_color || '#4f46e5',
            },
        })

        return Response.json({ ok: true })
    } catch (error) {
        return jsonError(error)
    }
}
