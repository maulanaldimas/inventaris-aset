'use client'

import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, MapPin, Building2 } from 'lucide-react'
import Sidebar from '../../components/sidebar'
import { useKonfirmasi } from '../../components/confirm'
import {
    EmptyState,
    PageHeader,
    TableSkeleton,
    btnPrimary,
    inputCls,
    mainCls,
    cardCls,
} from '../../components/ui'
import { useProfile } from '../../lib/use-profile'

export default function LokasiPage() {
    const [locations, setLocations] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const konfirmasi = useKonfirmasi()
    const { profile } = useProfile()

    const role = profile?.role

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await api.get('/api/locations')
                setLocations(data.locations)
            } catch {
                toast.error('Gagal memuat data lokasi')
            }
            setLoading(false)
        }

        fetchLocations()
    }, [refreshKey])

    const deleteLocation = async (loc) => {
        const ya = await konfirmasi({
            title: 'Hapus lokasi ini?',
            message: `${loc.name} akan dihapus permanen. Aset yang terhubung tidak ikut terhapus.`,
            confirmText: 'Ya, Hapus',
        })
        if (!ya) return
        try {
            await api.del(`/api/locations/${loc.id}`)
            toast.success('Lokasi berhasil dihapus')
            setRefreshKey((key) => key + 1)
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus lokasi')
        }
    }

    const filteredLocations = locations.filter(loc =>
        (loc.name || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <PageHeader title="Daftar Lokasi" description={`Kelola ${locations.length} lokasi penyimpanan aset`}>
                    {role === 'admin' && (
                        <Link href="/lokasi/tambah" className={btnPrimary}>
                            <Plus className="h-4 w-4" />
                            Tambah Lokasi
                        </Link>
                    )}
                </PageHeader>

                <div className={`${cardCls} mb-6 p-4`}>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama lokasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${inputCls} pl-9`}
                        />
                    </div>
                </div>

                <div className={`${cardCls} overflow-hidden`}>
                    {loading ? (
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>{['Lokasi', 'Gedung', 'Lantai', 'Aksi'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                ))}</tr>
                            </thead>
                            <TableSkeleton rows={5} cols={4} />
                        </table>
                    ) : filteredLocations.length === 0 ? (
                        <EmptyState
                            icon={MapPin}
                            title="Tidak ada lokasi"
                            description={
                                search
                                    ? 'Tidak ada lokasi yang cocok dengan pencarian.'
                                    : 'Belum ada lokasi tercatat. Tambahkan lokasi untuk mengelompokkan aset.'
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>{['Lokasi', 'Gedung', 'Lantai', 'Aksi'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLocations.map(loc => (
                                        <tr key={loc.id} className="group transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50">
                                                        <Building2 className="h-4 w-4 text-indigo-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900">{loc.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{loc.building || '-'}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{loc.floor || '-'}</td>
                                            <td className="px-5 py-3.5">
                                                {role === 'admin' ? (
                                                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                                                        <Link
                                                            href={`/lokasi/edit/${loc.id}`}
                                                            title="Edit lokasi"
                                                            className="rounded-md p-2 text-sky-500 transition hover:bg-sky-50 hover:text-sky-600"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteLocation(loc)}
                                                            title="Hapus lokasi"
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
