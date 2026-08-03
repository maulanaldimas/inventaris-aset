'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../components/sidebar'

export default function TambahPeminjamanPage() {
    const [formData, setFormData] = useState({
        asset_id: '',
        borrower_name: '',
        department: '',
        borrow_date: '',
        return_date: '',
        status: 'Dipinjam',
        notes: '',
    })
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchAssets()
    }, [])

    const fetchAssets = async () => {
        const { data } = await supabase
            .from('assets')
            .select('*')
            .eq('status', 'Tersedia')
        setAssets(data || [])
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const dataToSubmit = {
            ...formData,
            return_date: formData.return_date || null,
        }

        const { error: errorInsert } = await supabase.from('borrowings').insert([dataToSubmit])

        if (errorInsert) {
            alert('Error: ' + errorInsert.message)
            setLoading(false)
            return
        }

        // Update status aset jadi "Dipinjam"
        await supabase
            .from('assets')
            .update({ status: 'Dipinjam' })
            .eq('id', formData.asset_id)

        router.push('/peminjaman')
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <Link href="/peminjaman" className="text-blue-600 hover:text-blue-800"> ← Kembali </Link>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">Tambah Peminjaman</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aset *</label>
                            <select name="asset_id" value={formData.asset_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                                <option value="">Pilih aset...</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                ))}
                            </select>
                            {assets.length === 0 && (
                                <p className="text-xs text-orange-500 mt-1">Tidak ada aset berstatus "Tersedia" saat ini.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam *</label>
                                <input type="text" name="borrower_name" value={formData.borrower_name} onChange={handleChange} placeholder="Nama lengkap" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="IT, HR, dll" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam *</label>
                                <input type="date" name="borrow_date" value={formData.borrow_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rencana Kembali</label>
                                <input type="date" name="return_date" value={formData.return_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Catatan tambahan..." rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400">
                                {loading ? 'Menyimpan...' : 'Simpan Peminjaman'}
                            </button>
                            <Link href="/peminjaman" className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg text-center hover:bg-gray-400 font-medium">
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}