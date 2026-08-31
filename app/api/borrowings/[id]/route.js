import { db } from '../../../../lib/db'
import { requireAdmin, requireSession } from '../../../../lib/auth'
import { jsonError } from '../../../../lib/http'
import { logActivity } from '../../../../lib/log'
import { parseDateOnly } from '../../../../lib/dates'

export async function GET(_request, { params }) {
    try {
        const session = await requireSession()
        const { id } = await params

        const borrowing = await db.borrowing.findFirst({
            where: { id, companyId: session.companyId },
        })
        if (!borrowing) {
            return Response.json({ error: 'Data peminjaman tidak ditemukan' }, { status: 404 })
        }
        return Response.json({ borrowing })
    } catch (error) {
        return jsonError(error)
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await requireAdmin()
        const { id } = await params
        const body = await request.json()

        const existing = await db.borrowing.findFirst({
            where: { id, companyId: session.companyId },
            include: { asset: true },
        })
        if (!existing) {
            return Response.json({ error: 'Data peminjaman tidak ditemukan' }, { status: 404 })
        }

        const jadiDikembalikan = existing.status !== 'Dikembalikan' && body.status === 'Dikembalikan'

        const updated = await db.$transaction(async (tx) => {
            const borrowing = await tx.borrowing.update({
                where: { id },
                data: {
                    borrowerName: body.borrower_name?.trim(),
                    department: body.department || null,
                    borrowDate: parseDateOnly(body.borrow_date),
                    returnDate: parseDateOnly(body.return_date),
                    returnedAt:
                        body.status === 'Dikembalikan'
                            ? parseDateOnly(body.returned_at) || existing.returnedAt || new Date()
                            : null,
                    status: body.status || 'Dipinjam',
                    notes: body.notes || null,
                },
            })

            if (jadiDikembalikan && existing.asset) {
                await tx.asset.update({
                    where: { id: existing.assetId },
                    data: { status: 'Tersedia' },
                })
            }

            return borrowing
        })

        await logActivity(session, {
            entity: 'borrowing',
            entityId: id,
            action: jadiDikembalikan ? 'returned' : 'updated',
            detail: `${updated.borrowerName}${jadiDikembalikan ? ' mengembalikan aset' : ''}`,
        })

        return Response.json({ borrowing: updated })
    } catch (error) {
        return jsonError(error)
    }
}

export async function DELETE(_request, { params }) {
    try {
        const session = await requireAdmin()
        const { id } = await params

        const existing = await db.borrowing.findFirst({
            where: { id, companyId: session.companyId },
            include: { asset: { select: { name: true, code: true } } },
        })
        if (!existing) {
            return Response.json({ error: 'Data peminjaman tidak ditemukan' }, { status: 404 })
        }

        await db.borrowing.delete({ where: { id } })

        await logActivity(session, {
            entity: 'borrowing',
            entityId: id,
            action: 'deleted',
            detail: `${existing.borrowerName} — ${existing.asset?.name || '-'}`,
        })

        return Response.json({ ok: true })
    } catch (error) {
        return jsonError(error)
    }
}
