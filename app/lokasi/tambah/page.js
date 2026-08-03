'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../components/sidebar'

export default function TambahLokasiPage() {
    const [formData, setFormData] = useState({ name: '', building: '', floor: '' })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.from('locations').insert([formData])
        if (error) {
            alert('Error: ' + error.message)
        } else {
            router.push('/lokasi')
        }
        setLoading(false)
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <Link href="/lokasi" className="text-blue-600 hover:text-blue-800"> ← Kembali </Link>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">Tambah Lokasi Baru</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lokasi *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ruang IT" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gedung</label>
                                <input type="text" name="building" value={formData.building} onChange={handleChange} placeholder="Gedung A" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lantai</label>
                                <input type="text" name="floor" value={formData.floor} onChange={handleChange} placeholder="Lantai 1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400">
                                {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
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