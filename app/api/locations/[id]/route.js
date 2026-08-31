import { db } from '../../../../lib/db'
import { requireAdmin, requireSession } from '../../../../lib/auth'
import { jsonError } from '../../../../lib/http'
import { logActivity } from '../../../../lib/log'

export async function GET(_request, { params }) {
    try {
        const session = await requireSession()
        const { id } = await params

        const location = await db.location.findFirst({
            where: { id, companyId: session.companyId },
        })
        if (!location) {
            return Response.json({ error: 'Lokasi tidak ditemukan' }, { status: 404 })
        }
        return Response.json({ location })
    } catch (error) {
        return jsonError(error)
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await requireAdmin()
        const { id } = await params
        const body = await request.json()

        const existing = await db.location.findFirst({
            where: { id, companyId: session.companyId },
        })
        if (!existing) {
            return Response.json({ error: 'Lokasi tidak ditemukan' }, { status: 404 })
        }

        const updated = await db.location.update({
            where: { id },
            data: {
                name: body.name?.trim(),
                building: body.building || null,
                floor: body.floor || null,
            },
        })

        await logActivity(session, {
            entity: 'location',
            entityId: id,
            action: 'updated',
            detail: updated.name,
        })

        return Response.json({ location: updated })
    } catch (error) {
        return jsonError(error)
    }
}

export async function DELETE(_request, { params }) {
    try {
        const session = await requireAdmin()
        const { id } = await params

        const existing = await db.location.findFirst({
            where: { id, companyId: session.companyId },
        })
        if (!existing) {
            return Response.json({ error: 'Lokasi tidak ditemukan' }, { status: 404 })
        }

        try {
            await db.location.delete({ where: { id } })
        } catch (err) {
            if (err?.code === 'P2003') {
                return Response.json(
                    { error: 'Lokasi masih dipakai oleh aset — pindahkan asetnya terlebih dahulu' },
                    { status: 409 }
                )
            }
            throw err
        }

        await logActivity(session, {
            entity: 'location',
            entityId: id,
            action: 'deleted',
            detail: existing.name,
        })

        return Response.json({ ok: true })
    } catch (error) {
        return jsonError(error)
    }
}
