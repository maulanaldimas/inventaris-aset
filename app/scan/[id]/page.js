'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ScanAsetPage() {
    const params = useParams()
    const [asset, setAsset] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAsset()
    }, [])

    const fetchAsset = async () => {
        const { data } = await supabase
            .from('assets')
            .select('*, locations(name, building, floor)')
            .eq('id', params.id)
            .single()
        setAsset(data)
        setLoading(false)
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Memuat...</p></div>
    }

    if (!asset) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Aset tidak ditemukan</p></div>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow max-w-md w-full p-6">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">📦</div>
                    <h1 className="text-xl font-bold text-gray-800">{asset.name}</h1>
                    <p className="text-sm text-gray-500 font-mono">{asset.code}</p>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Kategori</span>
                        <span className="font-medium text-gray-800">{asset.category || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Merek</span>
                        <span className="font-medium text-gray-800">{asset.brand || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Kondisi</span>
                        <span className={`font-medium ${asset.condition === 'Baik' ? 'text-green-600' : 'text-red-600'}`}>{asset.condition}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Status</span>
                        <span className={`font-medium ${asset.status === 'Tersedia' ? 'text-green-600' : 'text-orange-500'}`}>{asset.status}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Lokasi</span>
                        <span className="font-medium text-gray-800">
                            {asset.locations ? `${asset.locations.name} (${asset.locations.building}, ${asset.locations.floor})` : '-'}
                        </span>
                    </div>
                    {asset.notes && (
                        <div className="pt-2">
                            <span className="text-gray-500 block mb-1">Catatan</span>
                            <p className="text-gray-800">{asset.notes}</p>
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400 text-center mt-6">Sistem Inventaris Aset</p>
            </div>
        </div>
    )
}