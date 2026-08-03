'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import Sidebar from '../../../components/sidebar'
import { QRCodeSVG } from 'qrcode.react'

export default function QRMassalPage() {
    const [assets, setAssets] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(true)
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        fetchAssets()
        setOrigin(window.location.origin)
    }, [])

    const fetchAssets = async () => {
        const { data } = await supabase
            .from('assets')
            .select('*')
            .order('code', { ascending: true })
        setAssets(data || [])
        setSelected((data || []).map(a => a.id)) // default semua tercentang
        setLoading(false)
    }

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

    if (loading) {
        return (
            <div className="flex">
                <div className="print:hidden"><Sidebar /></div>
                <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                    <p className="text-gray-500">Memuat...</p>
                </main>
            </div>
        )
    }

    return (
        <div className="flex">
            <div className="print:hidden">
                <Sidebar />
            </div>
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="print:hidden mb-6">
                    <Link href="/aset" className="text-blue-600 hover:text-blue-800"> ← Kembali </Link>
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Print QR Code Massal</h1>
                            <p className="text-gray-600">Pilih aset yang QR code-nya mau dicetak</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            disabled={selected.length === 0}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            🖨️ Cetak {selected.length} QR Code
                        </button>
                    </div>
                </div>

                <div className="print:hidden bg-white rounded-lg shadow p-4 mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            checked={selected.length === assets.length && assets.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4"
                        />
                        Pilih Semua ({assets.length} aset)
                    </label>
                </div>

                <div className="print:hidden bg-white rounded-lg shadow divide-y">
                    {assets.map(a => (
                        <label key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.includes(a.id)}
                                onChange={() => toggleSelect(a.id)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-900">{a.code}</span>
                            <span className="text-sm text-gray-600">{a.name}</span>
                        </label>
                    ))}
                </div>

                {/* Area yang bakal dicetak */}
                <div id="area-print-massal" className="hidden print:grid print:grid-cols-3 print:gap-4 print:justify-items-center">
                    {assetTerpilih.map(a => (
                        <div key={a.id} className="border border-gray-300 p-3 flex flex-col items-center text-center break-inside-avoid">
                            <QRCodeSVG value={`${origin}/scan/${a.id}`} size={100} />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}