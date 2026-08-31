import { db } from '../../../../lib/db'
import { jsonError } from '../../../../lib/http'

export async function GET(_request, { params }) {
    try {
        const { id } = await params
        const asset = await db.asset.findUnique({
            where: { id },
            include: { location: true, company: { select: { name: true } } },
        })

        if (!asset) {
            return Response.json({ error: 'Aset tidak ditemukan' }, { status: 404 })
        }

        return Response.json({
            asset: {
                ...asset,
                locations: asset.location,
                companies: asset.company,
            },
        })
    } catch (error) {
        return jsonError(error)
    }
}
