import { db } from '../../../lib/db'
import { requireSession, requireAdmin } from '../../../lib/auth'
import { jsonError } from '../../../lib/http'
import { logActivity } from '../../../lib/log'
import { parseDateOnly } from '../../../lib/dates'

export async function GET() {
    try {
        const session = await requireSession()
        const borrowings = await db.borrowing.findMany({
            where: { companyId: session.companyId },
            include: { asset: { select: { name: true, code: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return Response.json({
            borrowings: borrowings.map(({ asset, ...b }) => ({
                ...b,
                assets: asset, // bentuk nested seperti tampilan lama
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

        if (!body.asset_id || !body.borrower_name?.trim() || !body.borrow_date) {
            return Response.json({ error: 'Aset, nama peminjam, dan tanggal pinjam wajib diisi' }, { status: 400 })
        }

        const asset = await db.asset.findFirst({
            where: { id: body.asset_id, companyId: session.companyId },
        })
        if (!asset) {
            return Response.json({ error: 'Aset tidak ditemukan' }, { status: 404 })
        }

        const created = await db.$transaction(async (tx) => {
            const borrowing = await tx.borrowing.create({
                data: {
                    assetId: body.asset_id,
                    borrowerName: body.borrower_name.trim(),
                    department: body.department || null,
                    borrowDate: parseDateOnly(body.borrow_date),
                    returnDate: parseDateOnly(body.return_date),
                    returnedAt: null,
                    status: body.status || 'Dipinjam',
                    notes: body.notes || null,
                    companyId: session.companyId,
                },
            })

            await tx.asset.update({
                where: { id: body.asset_id },
                data: { status: 'Dipinjam' },
            })

            return borrowing
        })

        await logActivity(session, {
            entity: 'borrowing',
            entityId: created.id,
            action: 'borrowed',
            detail: `${created.borrowerName} meminjam ${asset.name} (${asset.code})`,
        })

        return Response.json({ borrowing: created }, { status: 201 })
    } catch (error) {
        return jsonError(error)
    }
}
