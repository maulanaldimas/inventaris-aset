'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../../components/sidebar'

export default function EditPeminjamanPage() {
    const params = useParams()
    const router = useRouter()
    const [formData, setFormData] = useState({
        borrower_name: '',
        department: '',
        borrow_date: '',
        return_date: '',
        returned_at: '',
        status: 'Dipinjam',
        notes: '',
        asset_id: '',
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        fetchBorrowing()
    }, [])

    const fetchBorrowing = async () => {
        const { data } = await supabase
            .from('borrowings')
            .select('*')
            .eq('id', params.id)
            .single()

        if (data) {
            setFormData({
                borrower_name: data.borrower_name || '',
                department: data.department || '',
                borrow_date: data.borrow_date || '',
                return_date: data.return_date || '',
                returned_at: data.returned_at || '',
                status: data.status || 'Dipinjam',
                notes: data.notes || '',
                asset_id: data.asset_id,
            })
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

        const dataToSubmit = {
            borrower_name: formData.borrower_name,
            department: formData.department,
            borrow_date: formData.borrow_date || null,
            return_date: formData.return_date || null,
            returned_at: formData.returned_at || null,
            status: formData.status,
            notes: formData.notes,
        }

        const { error } = await supabase
            .from('borrowings')
            .update(dataToSubmit)
            .eq('id', params.id)

        if (error) {
            alert('Error: ' + error.message)
            setLoading(false)
            return
        }

        // Kalau statusnya diubah jadi "Dikembalikan", update juga status aset jadi "Tersedia"
        if (formData.status === 'Dikembalikan') {
            await supabase
                .from('assets')
                .update({ status: 'Tersedia' })
                .eq('id', formData.asset_id)
        }

        router.push('/peminjaman')
    }

    const handleTandaiKembali = async () => {
        const hariIni = new Date().toISOString().split('T')[0]
        setFormData(prev => ({ ...prev, status: 'Dikembalikan', returned_at: hariIni }))
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
                        <Link href="/peminjaman" className="text-blue-600 hover:text-blue-800"> ← Kembali </Link>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">Edit Peminjaman</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
                                <input type="text" name="borrower_name" value={formData.borrower_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                                <input type="date" name="borrow_date" value={formData.borrow_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rencana Kembali</label>
                                <input type="date" name="return_date" value={formData.return_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="Dipinjam">Dipinjam</option>
                                    <option value="Dikembalikan">Dikembalikan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dikembalikan</label>
                                <input type="date" name="returned_at" value={formData.returned_at} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {formData.status === 'Dipinjam' && (
                            <button
                                type="button"
                                onClick={handleTandaiKembali}
                                className="w-full bg-green-50 text-green-700 border border-green-200 py-2 rounded-lg hover:bg-green-100 font-medium text-sm"
                            >
                                ✓ Tandai Sudah Dikembalikan Hari Ini
                            </button>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400">
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
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