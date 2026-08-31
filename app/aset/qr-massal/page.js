'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import Link from 'next/link'
import Sidebar from '../../../components/sidebar'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Printer, CheckSquare, Square } from 'lucide-react'
import { btnPrimary, cardCls, mainCls } from '../../../components/ui'

export default function QRMassalPage() {
    const [assets, setAssets] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const data = await api.get('/api/assets')
                const urut = data.assets.slice().sort((a, b) => (a.code || '').localeCompare(b.code || ''))
                setAssets(urut)
                setSelected(urut.map(a => a.id))
            } catch {
                toast.error('Gagal memuat data aset')
            }
            setLoading(false)
        }
        fetchAssets()
    }, [])

    const toggleSelect = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selected.length === assets.length) {
            setSelected([])
        } else {
            setSelected(assets.map(a => a.id))
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const assetTerpilih = assets.filter(a => selected.includes(a.id))
    const semuaTerpilih = selected.length === assets.length && assets.length > 0

    if (loading) {
        return (
            <div className="flex">
                <Sidebar />
                <main className={`${mainCls} grid place-items-center`}>
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                </main>
            </div>
        )
    }

    return (
        <div className="flex">
            <div className="print:hidden">
                <Sidebar />
            </div>
            <main className={mainCls}>
                <div className="mb-6">
                    <Link href="/aset" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-500">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>
                    <div className="mt-2 flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cetak QR Code Massal</h1>
                            <p className="mt-1 text-sm text-slate-500">Pilih aset yang label QR code-nya akan dicetak</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            disabled={selected.length === 0}
                            className={`${btnPrimary} disabled:bg-slate-300`}
                        >
                            <Printer className="h-4 w-4" />
                            Cetak {selected.length} Label
                        </button>
                    </div>
                </div>

                <div className={`${cardCls} mb-6 p-4`}>
                    <button
                        onClick={toggleSelectAll}
                        className={`flex items-center gap-2.5 text-sm font-medium transition ${semuaTerpilih ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        {semuaTerpilih ? (
                            <CheckSquare className="h-[18px] w-[18px] text-indigo-600" />
                        ) : (
                            <Square className="h-[18px] w-[18px]" />
                        )}
                        Pilih Semua ({assets.length} aset)
                    </button>
                </div>

                <div className={`${cardCls} divide-y divide-slate-100 overflow-hidden print:hidden`}>
                    {assets.map(a => {
                        const aktif = selected.includes(a.id)
                        return (
                            <button
                                key={a.id}
                                onClick={() => toggleSelect(a.id)}
                                className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition ${aktif ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}
                            >
                                {aktif ? (
                                    <CheckSquare className="h-[18px] w-[18px] shrink-0 text-indigo-600" />
                                ) : (
                                    <Square className="h-[18px] w-[18px] shrink-0 text-slate-300" />
                                )}
                                <span className="font-mono text-xs font-semibold text-slate-900">{a.code}</span>
                                <span className="text-sm text-slate-600">{a.name}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Area yang bakal dicetak */}
                <div id="area-print-massal" className="hidden print:grid print:grid-cols-3 print:gap-4 print:justify-items-center">
                    {assetTerpilih.map(a => (
                        <div key={a.id} className="flex w-40 flex-col items-center gap-1.5 break-inside-avoid rounded-lg border border-dashed border-slate-400 p-3 text-center">
                            <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${a.id}`} size={96} />
                            <span className="font-mono text-[10px] font-bold tracking-wide text-black">{a.code}</span>
                            <span className="w-full truncate text-[9px] leading-tight text-gray-700">{a.name}</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
