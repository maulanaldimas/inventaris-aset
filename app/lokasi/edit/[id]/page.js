'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../../components/sidebar'

export default function EditLokasiPage() {
    const [formData, setFormData] = useState({ name: '', building: '', floor: '' })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const router = useRouter()
    const params = useParams()

    useEffect(() => {
        fetchLocation()
    }, [])

    const fetchLocation = async () => {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('id', params.id)
            .single()

        if (data) {
            setFormData({ name: data.name, building: data.building || '', floor: data.floor || '' })
        }
        setFetching(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase
            .from('locations')
            .update(formData)
            .eq('id', params.id)

        if (error) {
            alert('Error: ' + error.message)
        } else {
            router.push('/lokasi')
        }
        setLoading(false)
    }

    if (fetching) {
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
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <Link href="/lokasi" className="text-blue-600 hover:text-blue-800"> ← Kembali </Link>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">Edit Lokasi</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lokasi *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gedung</label>
                                <input type="text" name="building" value={formData.building} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lantai</label>
                                <input type="text" name="floor" value={formData.floor} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400">
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                            <Link href="/lokasi" className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg text-center hover:bg-gray-400 font-medium">
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}