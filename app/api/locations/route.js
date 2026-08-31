import { db } from '../../../lib/db'
import { requireSession, requireAdmin } from '../../../lib/auth'
import { jsonError } from '../../../lib/http'
import { logActivity } from '../../../lib/log'

export async function GET() {
    try {
        const session = await requireSession()
        const locations = await db.location.findMany({
            where: { companyId: session.companyId },
            orderBy: { createdAt: 'desc' },
        })
        return Response.json({ locations })
    } catch (error) {
        return jsonError(error)
    }
}

export async function POST(request) {
    try {
        const session = await requireAdmin()
        const body = await request.json()

        if (!body.name?.trim()) {
            return Response.json({ error: 'Nama lokasi wajib diisi' }, { status: 400 })
        }

        const created = await db.location.create({
            data: {
                name: body.name.trim(),
                building: body.building || null,
                floor: body.floor || null,
                companyId: session.companyId,
            },
        })

        await logActivity(session, {
            entity: 'location',
            entityId: created.id,
            action: 'created',
            detail: created.name,
        })

        return Response.json({ location: created }, { status: 201 })
    } catch (error) {
        return jsonError(error)
    }
}
