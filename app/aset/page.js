'use client'

import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import {
    Plus,
    Search,
    QrCode,
    Pencil,
    Trash2,
    Boxes,
    Printer,
} from 'lucide-react'
import Sidebar from '../../components/sidebar'
import { useKonfirmasi } from '../../components/confirm'
import { useProfile } from '../../lib/use-profile'
import {
    Badge,
    EmptyState,
    PageHeader,
    TableSkeleton,
    btnPrimary,
    btnSecondary,
    inputCls,
    mainCls,
    cardCls,
} from '../../components/ui'
import { STATUS_ASET, KONDISI_ASET } from '../../lib/constants'

export default function AsetPage() {
    const [assets, setAssets] = useState([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('Semua')
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const konfirmasi = useKonfirmasi()
    const { profile } = useProfile()

    const role = profile?.role

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const data = await api.get('/api/assets')
                setAssets(data.assets)
            } catch {
                toast.error('Gagal memuat data aset')
            }
            setLoading(false)
        }

        fetchAssets()
    }, [refreshKey])

    const deleteAsset = async (asset) => {
        const ya = await konfirmasi({
            title: 'Hapus aset ini?',
            message: `${asset.name} (${asset.code}) akan dihapus permanen dan tidak dapat dikembalikan.`,
            confirmText: 'Ya, Hapus',
        })
        if (!ya) return
        try {
            await api.del(`/api/assets/${asset.id}`)
            toast.success('Aset berhasil dihapus')
            setRefreshKey((key) => key + 1)
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus aset')
        }
    }

    const filteredAssets = assets.filter(asset => {
        const q = search.toLowerCase()
        const cocokCari =
            (asset.name || '').toLowerCase().includes(q) ||
            (asset.code || '').toLowerCase().includes(q)
        const cocokStatus = statusFilter === 'Semua' || asset.status === statusFilter
        return cocokCari && cocokStatus
    })

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <PageHeader
                    title="Daftar Aset"
                    description={`Kelola ${assets.length} aset perusahaan`}
                >
                    <Link href="/aset/qr-massal" className={btnSecondary}>
                        <Printer className="h-4 w-4" />
                        Cetak QR Massal
                    </Link>
                    {role === 'admin' && (
                        <Link href="/aset/tambah" className={btnPrimary}>
                            <Plus className="h-4 w-4" />
                            Tambah Aset
                        </Link>
                    )}
                </PageHeader>

                <div className={`${cardCls} mb-6 p-4`}>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative min-w-56 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau kode aset..."
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
                            <option>Tersedia</option>
                            <option>Dipinjam</option>
                            <option>Rusak</option>
                        </select>
                    </div>
                </div>

                <div className={`${cardCls} overflow-hidden`}>
                    {loading ? (
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>{['Aset', 'Kode', 'Kondisi', 'Status', 'Aksi'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                ))}</tr>
                            </thead>
                            <TableSkeleton rows={6} cols={5} />
                        </table>
                    ) : filteredAssets.length === 0 ? (
                        <EmptyState
                            icon={Boxes}
                            title="Tidak ada aset"
                            description={
                                search || statusFilter !== 'Semua'
                                    ? 'Tidak ada aset yang cocok dengan pencarian atau filter.'
                                    : 'Belum ada aset tercatat. Tambahkan aset pertama Anda.'
                            }
                            action={
                                role === 'admin' && !search && statusFilter === 'Semua' ? (
                                    <Link href="/aset/tambah" className={btnPrimary}>
                                        <Plus className="h-4 w-4" />
                                        Tambah Aset
                                    </Link>
                                ) : undefined
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>{['Aset', 'Kode', 'Kondisi', 'Status', 'Aksi'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAssets.map(asset => (
                                        <tr key={asset.id} className="group transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {asset.photo_url ? (
                                                        <Image
                                                            src={asset.photo_url}
                                                            alt={asset.name}
                                                            width={40}
                                                            height={40}
                                                            className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100">
                                                            <Boxes className="h-4 w-4 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{asset.name}</p>
                                                        <p className="text-xs text-slate-400">{asset.category || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900">{asset.code}</td>
                                            <td className="px-5 py-3.5"><Badge label={asset.condition} map={KONDISI_ASET} /></td>
                                            <td className="px-5 py-3.5"><Badge label={asset.status} map={STATUS_ASET} /></td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                                                    <Link
                                                        href={`/aset/qr/${asset.id}`}
                                                        title="Lihat QR Code"
                                                        className="rounded-md p-2 text-violet-500 transition hover:bg-violet-50 hover:text-violet-600"
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                    </Link>
                                                    {role === 'admin' && (
                                                        <>
                                                            <Link
                                                                href={`/aset/edit/${asset.id}`}
                                                                title="Edit aset"
                                                                className="rounded-md p-2 text-sky-500 transition hover:bg-sky-50 hover:text-sky-600"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => deleteAsset(asset)}
                                                                title="Hapus aset"
                                                                className="rounded-md p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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
