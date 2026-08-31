import { db } from '../../../lib/db'
import { requireSession, requireAdmin } from '../../../lib/auth'
import { jsonError } from '../../../lib/http'
import { logActivity } from '../../../lib/log'
import { parseDateOnly } from '../../../lib/dates'

export async function GET() {
    try {
        const session = await requireSession()
        const assets = await db.asset.findMany({
            where: { companyId: session.companyId },
            include: { location: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return Response.json({
            assets: assets.map(({ location, ...a }) => ({
                ...a,
                locations: location, // bentuk nested seperti tampilan lama
            })),
        })
    } catch (error) {
        return jsonError(error)
    }
}

export async function POST(request) {
    try {
        const session = await requireAdmin()
        const body = await request.json()

        if (!body.code || !body.name) {
            return Response.json({ error: 'Kode dan nama aset wajib diisi' }, { status: 400 })
        }

        const created = await db.asset.create({
            data: {
                code: body.code.trim(),
                name: body.name.trim(),
                category: body.category || null,
                brand: body.brand || null,
                condition: body.condition || 'Baik',
                status: body.status || 'Tersedia',
                locationId: body.location_id || null,
                purchaseDate: parseDateOnly(body.purchase_date),
                purchasePrice: body.purchase_price ?? null,
                photoUrl: body.photo_url || null,
                notes: body.notes || null,
                companyId: session.companyId,
            },
        })

        await logActivity(session, {
            entity: 'asset',
            entityId: created.id,
            action: 'created',
            detail: `${created.name} (${created.code})`,
        })

        return Response.json({ asset: created }, { status: 201 })
    } catch (error) {
        if (error?.code === 'P2002') {
            return Response.json({ error: 'Kode aset sudah dipakai' }, { status: 409 })
        }
        return jsonError(error)
    }
}
