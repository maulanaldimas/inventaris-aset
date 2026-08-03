'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Sidebar from '../../components/sidebar'

export default function AsetPage () {
    const [assets, setAssets] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState(null)

    useEffect(() => {
        fetchAssets()
        fetchRole()
    }, [])

    const fetchRole = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            setRole(data?.role || null)
        }
    }
    const fetchAssets = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('assets')
            .select('*')
            .order('created_at', { ascending: false })
        setAssets(data || [])
        setLoading(false)
    }
    const deleteAsset = async (id) => {
        if (confirm('Yakin ingin hapus aset ini?')) {
            await supabase.from('assets').delete().eq('id', id)
            fetchAssets()
        }
    }
    const filteredAssets = assets.filter(asset => asset.name.toLowerCase().includes(search.toLowerCase()) || asset.code.toLowerCase().includes(search.toLowerCase()))
    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Daftar Aset</h1>
                        <p className="text-gray-600">Kelola semua aset perusahaan</p>
                    </div>
                    <div className="flex gap-2">
                        {role === 'admin' && (
                            <Link href="/aset/tambah" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                                + Tambah Aset
                            </Link>
                        )}
                        <Link href="/aset/qr-massal" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
                            🖨️ Print QR Massal
                        </Link>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <input
                        type="text"
                        placeholder="Cari nama atau kode aset..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <p className="p-6 text-center text-gray-600">Memuat data...</p>
                    ) : filteredAssets.length === 0 ? (
                        <p className="p-6 text-center text-gray-600">Tidak ada aset</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Foto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Kategori</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAssets.map(asset => (
                                        <tr key={asset.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {asset.photo_url ? (
                                                    <img src={asset.photo_url} alt={asset.name} className="w-10 h-10 object-cover rounded-lg" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">-</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{asset.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{asset.category}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${asset.status === 'Tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/aset/qr/${asset.id}`} className="text-purple-600 hover:text-purple-900 mr-4">
                                                    QR
                                                </Link>
                                                {role === 'admin' && (
                                                    <>
                                                        <Link href={`/aset/edit/${asset.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => deleteAsset(asset.id)} className="text-red-600 hover:text-red-900">
                                                            Hapus
                                                        </button>
                                                    </>
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