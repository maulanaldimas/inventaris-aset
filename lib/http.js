import { AuthError } from './auth'

export function jsonError(error) {
    if (!(error instanceof AuthError)) {
        console.error('[api-error]', error)
    }
    const status = error instanceof AuthError ? error.status : 500
    const message = status === 500 ? 'Terjadi kesalahan pada server' : error.message
    return Response.json({ error: message }, { status })
}
