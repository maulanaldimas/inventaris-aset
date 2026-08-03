'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import Sidebar from '../../../../components/sidebar'
import { QRCodeSVG } from 'qrcode.react'

export default function QRAsetPage() {
    const params = useParams()
    const [asset, setAsset] = useState(null)
    const [loading, setLoading] = useState(true)
    const [urlScan, setUrlScan] = useState('')

    useEffect(() => {
        fetchAsset()
        setUrlScan(`${window.location.origin}/scan/${params.id}`)
    }, [])

    const fetchAsset = async () => {
        const { data } = await supabase
            .from('assets')
            .select('*')
            .eq('id', params.id)
            .single()
        setAsset(data)
        setLoading(false)
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="flex">
                <Sidebar />
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
                <div className="max-w-md">
                    <div className="mb-6 print:hidden">
                        <Link href="/aset" className="text-blue-600 hover:text-blue-800"> ← Kembali </Link>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">QR Code Aset</h1>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 text-center" id="area-print">
                        <div className="flex justify-center mb-4">
                            <QRCodeSVG value={urlScan} size={200} />
                        </div>
                        <h2 className="font-bold text-gray-800">{asset.name}</h2>
                        <p className="text-sm text-gray-500 font-mono">{asset.code}</p>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium print:hidden"
                    >
                        🖨️ Cetak QR Code
                    </button>
                </div>
            </main>
        </div>
    )
}