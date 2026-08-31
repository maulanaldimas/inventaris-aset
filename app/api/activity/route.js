import { db } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'
import { jsonError } from '../../../lib/http'

export async function GET() {
    try {
        const session = await requireAdmin()
        const logs = await db.activityLog.findMany({
            where: { companyId: session.companyId },
            orderBy: { createdAt: 'desc' },
            take: 300,
        })
        return Response.json({
            logs: logs.map((log) => ({
                id: log.id,
                created_at: log.createdAt,
                actor_email: log.actorEmail,
                entity: log.entity,
                entity_id: log.entityId,
                action: log.action,
                detail: log.detail,
            })),
        })
    } catch (error) {
        return jsonError(error)
    }
}
