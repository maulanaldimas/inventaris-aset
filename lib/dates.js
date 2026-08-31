export function parseDateOnly(value) {
    if (!value) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T00:00:00.000Z`)
    }
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}
