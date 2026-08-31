import { db } from './db'

export async function logActivity(session, { entity, entityId, action, detail }) {
    if (!session?.companyId || !session?.sub) return
    try {
        await db.activityLog.create({
            data: {
                companyId: session.companyId,
                userId: session.sub,
                actorEmail: session.email,
                entity,
                entityId: entityId || null,
                action,
                detail: detail || null,
            },
        })
    } catch {
        // Logging tidak boleh menggagalkan aksi utama
    }
}
