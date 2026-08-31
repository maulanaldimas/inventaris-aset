import { db } from '../../../../lib/db'
import { requireAdmin, requireSession } from '../../../../lib/auth'
import { jsonError } from '../../../../lib/http'
import { logActivity } from '../../../../lib/log'
import { parseDateOnly } from '../../../../lib/dates'

export async function GET(_request, { params }) {
    try {
        const session = await requireSession()
        const { id } = await params

        const asset = await db.asset.findFirst({
            where: { id, companyId: session.companyId },
        })
        if (!asset) {
            return Response.json({ error: 'Aset tidak ditemukan' }, { status: 404 })
        }
        return Response.json({ asset })
    } catch (error) {
        return jsonError(error)
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await requireAdmin()
        const { id } = await params
        const body = await request.json()

        const existing = await db.asset.findFirst({
            where: { id, companyId: session.companyId },
        })
        if (!existing) {
            return Response.json({ error: 'Aset tidak ditemukan' }, { status: 404 })
        }

        const updated = await db.asset.update({
            where: { id },
            data: {
                code: body.code?.trim(),
                name: body.name?.trim(),
                category: body.category || null,
                brand: body.brand || null,
                condition: body.condition || 'Baik',
                status: body.status || 'Tersedia',
                locationId: body.location_id || null,
                purchaseDate: parseDateOnly(body.purchase_date),
                purchasePrice: body.purchase_price ?? null,
                photoUrl: body.photo_url ?? existing.photoUrl,
                notes: body.notes || null,
            },
        })

        await logActivity(session, {
            entity: 'asset',
            entityId: id,
            action: 'updated',
            detail: `${updated.name} (${updated.code})`,
        })

        return Response.json({ asset: updated })
    } catch (error) {
        return jsonError(error)
    }
}

export async function DELETE(_request, { params }) {
    try {
        const session = await requireAdmin()
        const { id } = await params

        const existing = await db.asset.findFirst({
            where: { id, companyId: session.companyId },
        })
        if (!existing) {
            return Response.json({ error: 'Aset tidak ditemukan' }, { status: 404 })
        }

        try {
            await db.asset.delete({ where: { id } })
        } catch (err) {
            if (err?.code === 'P2003') {
                return Response.json(
                    { error: 'Aset memiliki riwayat peminjaman — hapus catatannya terlebih dahulu' },
                    { status: 409 }
                )
            }
            throw err
        }

        await logActivity(session, {
            entity: 'asset',
            entityId: id,
            action: 'deleted',
            detail: `${existing.name} (${existing.code})`,
        })

        return Response.json({ ok: true })
    } catch (error) {
        return jsonError(error)
    }
}
