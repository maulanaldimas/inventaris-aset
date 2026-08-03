'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Sidebar from '../../components/sidebar'

export default function LokasiPage() {
    const [locations, setLocations] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState(null)

    useEffect(() => {
        fetchLocations()
        fetchRole()
    }, [])

    const fetchRole = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            setRole(data?.role || null)
        }
    }

    const fetchLocations = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('locations')
            .select('*')
            .order('created_at', { ascending: false })
        setLocations(data || [])
        setLoading(false)
    }

    const deleteLocation = async (id) => {
        if (confirm('Yakin ingin hapus lokasi ini?')) {
            await supabase.from('locations').delete().eq('id', id)
            fetchLocations()
        }
    }

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Daftar Lokasi</h1>
                        <p className="text-gray-600">Kelola lokasi penyimpanan aset</p>
                    </div>
                    {role === 'admin' && (
                        <Link href="/lokasi/tambah" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                            + Tambah Lokasi
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <input
                        type="text"
                        placeholder="Cari nama lokasi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <p className="p-6 text-center text-gray-600">Memuat data...</p>
                    ) : filteredLocations.length === 0 ? (
                        <p className="p-6 text-center text-gray-600">Tidak ada lokasi</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Nama Lokasi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Gedung</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Lantai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredLocations.map(loc => (
                                        <tr key={loc.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{loc.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{loc.building}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{loc.floor}</td>
                                            <td className="px-6 py-4">
                                                {role === 'admin' ? (
                                                    <>
                                                        <Link href={`/lokasi/edit/${loc.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => deleteLocation(loc.id)} className="text-red-600 hover:text-red-900">
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