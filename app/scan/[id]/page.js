'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '../../../lib/api'
import toast from 'react-hot-toast'
import { Boxes, MapPin } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '../../../components/ui'
import { STATUS_ASET, KONDISI_ASET } from '../../../lib/constants'

export default function ScanAsetPage() {
    const params = useParams()
    const [asset, setAsset] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const data = await api.get(`/api/scan/${params.id}`)
                setAsset(data.asset)
            } catch {
                toast.error('Aset tidak ditemukan')
            }
            setLoading(false)
        }
        fetchAsset()
    }, [params.id])

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 to-indigo-100">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </div>
        )
    }

    if (!asset) {
        return (
            <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 to-indigo-100">
                <div className="rounded-xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
                    <p className="text-lg font-semibold text-slate-900">Aset tidak ditemukan</p>
                    <p className="mt-1 text-sm text-slate-500">QR code tidak valid atau aset telah dihapus.</p>
                </div>
            </div>
        )
    }

    const rows = [
        ['Kategori', asset.category || '-'],
        ['Merek', asset.brand || '-'],
        ['Lokasi', asset.locations
            ? `${asset.locations.name}${asset.locations.building ? ` · ${asset.locations.building}` : ''}${asset.locations.floor ? `, ${asset.locations.floor}` : ''}`
            : '-'],
    ]

    return (
        <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-5 text-center text-white">
                        {asset.photo_url ? (
                            <Image
                                src={asset.photo_url}
                                alt={asset.name}
                                width={72}
                                height={72}
                                className="mx-auto mb-2 h-18 w-18 rounded-xl object-cover ring-4 ring-white/30"
                            />
                        ) : (
                            <Boxes className="mx-auto mb-1 h-9 w-9 opacity-90" />
                        )}
                        <h1 className="text-lg font-bold">{asset.name}</h1>
                        <p className="mt-0.5 font-mono text-xs text-indigo-100">{asset.code}</p>
                    </div>

                    <div className="space-y-3 p-6">
                        {rows.map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2.5 text-sm last:border-0">
                                <span className="shrink-0 text-slate-400">{label}</span>
                                <span className="text-right font-medium text-slate-800">{value}</span>
                            </div>
                        ))}

                        <div className="flex items-center justify-between gap-4 pt-1">
                            <span className="text-sm text-slate-400">Kondisi</span>
                            <Badge label={asset.condition} map={KONDISI_ASET} />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-400">Status</span>
                            <Badge label={asset.status} map={STATUS_ASET} />
                        </div>

                        {asset.notes && (
                            <div className="pt-1">
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Catatan</p>
                                <p className="text-sm leading-relaxed text-slate-800">{asset.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 py-3 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        Sistem Inventaris Aset Perusahaan
                    </div>
                </div>
            </div>
        </div>
    )
}
