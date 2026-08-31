'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/sidebar'
import { Badge, EmptyState, PageHeader, TableSkeleton, mainCls, cardCls } from '../../components/ui'
import { useProfile } from '../../lib/use-profile'
import { api } from '../../lib/api'
import { AKSI_LOG_CLS, AKSI_LOG_LABEL, ENTITAS_LOG_LABEL } from '../../lib/constants'
import { formatDateTime } from '../../lib/format'

const LOG_BADGE_MAP = Object.fromEntries(
    Object.entries(AKSI_LOG_LABEL).map(([key, label]) => [label, AKSI_LOG_CLS[key]])
)

function DaftarAktivitas() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.get('/api/activity')
                setLogs(data.logs)
            } catch {
                toast.error('Gagal memuat riwayat aktivitas')
            }
            setLoading(false)
        }
        fetchLogs()
    }, [])

    return (
        <div className={`${cardCls} overflow-hidden`}>
            {loading ? (
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>{['Waktu', 'Pengguna', 'Aksi', 'Entitas', 'Detail'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                        ))}</tr>
                    </thead>
                    <TableSkeleton rows={8} cols={5} />
                </table>
            ) : logs.length === 0 ? (
                <EmptyState
                    title="Belum ada aktivitas"
                    description="Setiap penambahan, perubahan, dan penghapusan data akan tercatat di sini."
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>{['Waktu', 'Pengguna', 'Aksi', 'Entitas', 'Detail'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map(log => (
                                <tr key={log.id} className="transition hover:bg-slate-50/60">
                                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600">{formatDateTime(log.created_at)}</td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{log.actor_email || '-'}</td>
                                    <td className="px-5 py-3.5"><Badge label={AKSI_LOG_LABEL[log.action] || log.action} map={LOG_BADGE_MAP} /></td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">{ENTITAS_LOG_LABEL[log.entity] || log.entity}</td>
                                    <td className="px-5 py-3.5 text-sm text-slate-500">{log.detail || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default function AktivitasPage() {
    const { profile, loading } = useProfile()

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <PageHeader
                    title="Riwayat Aktivitas"
                    description="Audit trail semua perubahan data perusahaan"
                />
                {!loading && profile?.role !== 'admin' ? (
                    <div className={cardCls}>
                        <EmptyState
                            title="Khusus admin"
                            description="Hanya admin yang dapat melihat riwayat aktivitas."
                        />
                    </div>
                ) : profile ? (
                    <DaftarAktivitas />
                ) : null}
            </main>
        </div>
    )
}
