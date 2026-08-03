'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Sidebar from '../../components/sidebar'

export default function PeminjamanPage() {
    const [borrowings, setBorrowings] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState(null)

    useEffect(() => {
        fetchBorrowings()
        fetchRole()
    }, [])

    const fetchRole = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            setRole(data?.role || null)
        }
    }

    const fetchBorrowings = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('borrowings')
            .select('*, assets(name, code)')
            .order('created_at', { ascending: false })
        setBorrowings(data || [])
        setLoading(false)
    }

    const deleteBorrowing = async (id) => {
        if (confirm('Yakin ingin hapus catatan peminjaman ini?')) {
            await supabase.from('borrowings').delete().eq('id', id)
            fetchBorrowings()
        }
    }

    const filteredBorrowings = borrowings.filter(b =>
        b.borrower_name.toLowerCase().includes(search.toLowerCase()) ||
        (b.assets?.name || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Daftar Peminjaman</h1>
                        <p className="text-gray-600">Kelola peminjaman aset</p>
                    </div>
                    {role === 'admin' && (
                        <Link href="/peminjaman/tambah" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                            + Tambah Peminjaman
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <input
                        type="text"
                        placeholder="Cari nama peminjam atau aset..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <p className="p-6 text-center text-gray-600">Memuat data...</p>
                    ) : filteredBorrowings.length === 0 ? (
                        <p className="p-6 text-center text-gray-600">Tidak ada data peminjaman</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Aset</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Peminjam</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Departemen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Tgl Pinjam</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBorrowings.map(b => (
                                        <tr key={b.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.assets?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{b.borrower_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{b.department}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{b.borrow_date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${b.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {role === 'admin' ? (
                                                    <>
                                                        <Link href={`/peminjaman/edit/${b.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => deleteBorrowing(b.id)} className="text-red-600 hover:text-red-900">
                                                            Hapus
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}