'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/sidebar'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, baik: 0, rusak: 0, dipinjam: 0 })
  const [assets, setAssets] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('assets').select('*')
      if (data) {
        setAssets(data)
        setStats({
          total: data.length,
          baik: data.filter(a => a.condition === 'Baik').length,
          rusak: data.filter(a => a.condition === 'Rusak').length,
          dipinjam: data.filter(a => a.status === 'Dipinjam').length,
        })
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </main>
    </div>
  )

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Ringkasan inventaris aset</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">Keluar</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Aset', value: stats.total, icon: '📦' },
            { label: 'Kondisi Baik', value: stats.baik, icon: '✅' },
            { label: 'Rusak', value: stats.rusak, icon: '⚠️' },
            { label: 'Dipinjam', value: stats.dipinjam, icon: '🔄' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg shadow p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Daftar Aset Terbaru</h3>
            <button onClick={() => router.push('/aset')} className="text-sm text-blue-600 hover:underline">Lihat semua →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>{['Kode', 'Nama Aset', 'Kategori', 'Kondisi', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-700">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.slice(0, 5).map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{a.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{a.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.condition === 'Baik' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {a.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}