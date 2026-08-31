'use client'

import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, ArrowLeftRight } from 'lucide-react'
import Sidebar from '../../components/sidebar'
import { useKonfirmasi } from '../../components/confirm'
import {
    Badge,
    EmptyState,
    PageHeader,
    TableSkeleton,
    btnPrimary,
    inputCls,
    mainCls,
    cardCls,
} from '../../components/ui'
import { STATUS_PEMINJAMAN } from '../../lib/constants'
import { formatDate } from '../../lib/format'
import { useProfile } from '../../lib/use-profile'

export default function PeminjamanPage() {
    const [borrowings, setBorrowings] = useState([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua')
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const konfirmasi = useKonfirmasi()
    const { profile } = useProfile()

    const role = profile?.role

    useEffect(() => {
        const fetchBorrowings = async () => {
            try {
                const data = await api.get('/api/borrowings')
                setBorrowings(data.borrowings)
            } catch {
                toast.error('Gagal memuat data peminjaman')
            }
            setLoading(false)
        }

        fetchBorrowings()
    }, [refreshKey])

    const deleteBorrowing = async (borrowing) => {
        const ya = await konfirmasi({
            title: 'Hapus catatan peminjaman?',
            message: `Catatan peminjaman oleh ${borrowing.borrower_name} akan dihapus permanen.`,
            confirmText: 'Ya, Hapus',
        })
        if (!ya) return
        try {
            await api.del(`/api/borrowings/${borrowing.id}`)
            toast.success('Catatan peminjaman dihapus')
            setRefreshKey((key) => key + 1)
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus catatan')
        }
    }

    const filteredBorrowings = borrowings.filter(b => {
        const q = search.toLowerCase()
        const cocokCari =
            (b.borrower_name || '').toLowerCase().includes(q) ||
            (b.assets?.name || '').toLowerCase().includes(q)
        const cocokStatus = statusFilter === 'Semua' || b.status === statusFilter
        return cocokCari && cocokStatus
    })

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <PageHeader title="Daftar Peminjaman" description={`Kelola ${borrowings.length} catatan peminjaman aset`}>
                    {role === 'admin' && (
                        <Link href="/peminjaman/tambah" className={btnPrimary}>
                            <Plus className="h-4 w-4" />
                            Tambah Peminjaman
                        </Link>
                    )}
                </PageHeader>

                <div className={`${cardCls} mb-6 p-4`}>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative min-w-56 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama peminjam atau aset..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`${inputCls} pl-9`}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`${inputCls} w-auto`}
                        >
                            <option>Semua</option>
                            <option>Dipinjam</option>
                            <option>Dikembalikan</option>
                        </select>
                    </div>
                </div>

                <div className={`${cardCls} overflow-hidden`}>
                    {loading ? (
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>{['Aset', 'Peminjam', 'Tgl Pinjam', 'Rencana Kembali', 'Status', 'Aksi'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                ))}</tr>
                            </thead>
                            <TableSkeleton rows={6} cols={6} />
                        </table>
                    ) : filteredBorrowings.length === 0 ? (
                        <EmptyState
                            icon={ArrowLeftRight}
                            title="Tidak ada catatan peminjaman"
                            description={
                                search || statusFilter !== 'Semua'
                                    ? 'Tidak ada data yang cocok dengan pencarian atau filter.'
                                    : 'Belum ada aktivitas peminjaman tercatat.'
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>{['Aset', 'Peminjam', 'Tgl Pinjam', 'Rencana Kembali', 'Status', 'Aksi'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBorrowings.map(b => (
                                        <tr key={b.id} className="group transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-medium text-slate-900">{b.assets?.name || '-'}</p>
                                                <p className="font-mono text-xs text-slate-400">{b.assets?.code || ''}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-medium text-slate-900">{b.borrower_name}</p>
                                                <p className="text-xs text-slate-400">{b.department || '-'}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(b.borrow_date)}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(b.return_date)}</td>
                                            <td className="px-5 py-3.5"><Badge label={b.status} map={STATUS_PEMINJAMAN} /></td>
                                            <td className="px-5 py-3.5">
                                                {role === 'admin' ? (
                                                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                                                        <Link
                                                            href={`/peminjaman/edit/${b.id}`}
                                                            title="Edit peminjaman"
                                                            className="rounded-md p-2 text-sky-500 transition hover:bg-sky-50 hover:text-sky-600"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteBorrowing(b)}
                                                            title="Hapus catatan"
                                                            className="rounded-md p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
