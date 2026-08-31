'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '../../../../lib/api'
import Link from 'next/link'
import Sidebar from '../../../../components/sidebar'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Printer } from 'lucide-react'
import { btnPrimary, cardCls, mainCls } from '../../../../components/ui'

export default function QRAsetPage() {
    const params = useParams()
    const [asset, setAsset] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const data = await api.get(`/api/assets/${params.id}`)
                setAsset(data.asset)
            } catch {
                toast.error('Gagal memuat data aset')
            }
            setLoading(false)
        }
        fetchAsset()
    }, [params.id])

    const handlePrint = () => {
        window.print()
    }

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
            <main className={`${mainCls} print:p-0`}>
                <div className="mx-auto max-w-sm print:max-w-none">
                    <div className="mb-6 print:hidden">
                        <Link href="/aset" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-500">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">QR Code Aset</h1>
                        <p className="mt-1 text-sm text-slate-500">Cetak dan tempelkan label pada aset</p>
                    </div>

                    <div id="area-print" className={`${cardCls} p-8 text-center`}>
                        <div className="mb-5 flex justify-center rounded-xl border border-dashed border-slate-200 p-6 print:border-0 print:p-0">
                            <QRCodeSVG
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${asset.id}`}
                                size={192}
                            />
                        </div>
                        <h2 className="text-base font-bold text-slate-900">{asset.name}</h2>
                        <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold tracking-wide text-slate-600">
                            {asset.code}
                        </span>
                        <p className="mt-3 text-xs text-slate-400">Scan QR untuk melihat detail aset</p>
                    </div>

                    <button onClick={handlePrint} className={`${btnPrimary} mt-5 w-full print:hidden`}>
                        <Printer className="h-4 w-4" />
                        Cetak QR Code
                    </button>
                </div>
            </main>
        </div>
    )
}
