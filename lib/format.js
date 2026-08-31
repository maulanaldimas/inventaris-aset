export function formatRupiah(value) {
    const angka = Number(value)
    if (value === null || value === undefined || value === '' || Number.isNaN(angka)) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(angka)
}

export function formatDate(value) {
    if (!value) return '-'
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (!match) return value
    const [, y, m, d] = match
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(Number(y), Number(m) - 1, Number(d)))
}

export function formatDateTime(value) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

export function todayISO() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}
