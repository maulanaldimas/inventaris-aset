'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Boxes, Wallet, AlertTriangle, ArrowLeftRight, LogOut } from 'lucide-react'
import { api } from '../../lib/api'
import Sidebar from '../../components/sidebar'
import { Badge, StatCard, EmptyState, PageHeader } from '../../components/ui'
import { STATUS_ASET, KONDISI_ASET } from '../../lib/constants'
import { formatRupiah } from '../../lib/format'
import { useProfile } from '../../lib/use-profile'

export default function Dashboard() {
  const router = useRouter()
  const { profile } = useProfile()
  const [stats, setStats] = useState({ total: 0, nilai: 0, baik: 0, rusak: 0, dipinjam: 0 })
  const [assets, setAssets] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await api.get('/api/auth/me')
        if (!me.profile) { router.replace('/login'); return }
        setUser({ email: me.profile.email })
      } catch {
        router.replace('/login')
        return
      }
      try {
        const data = await api.get('/api/assets')
        setAssets(data.assets)
        setStats({
          total: data.assets.length,
          nilai: data.assets.reduce((sum, a) => sum + (Number(a.purchase_price) || 0), 0),
          rusak: data.assets.filter(a => a.condition === 'Rusak').length,
          dipinjam: data.assets.filter(a => a.status === 'Dipinjam').length,
        })
      } catch {
        toast.error('Gagal memuat data aset')
      }
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      router.replace('/login')
    }
  }

  if (loading) return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-slate-500">Memuat dashboard...</p>
        </div>
      </main>
    </div>
  )

  const asetTerbaru = [...assets]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-6 md:p-8 min-h-screen bg-slate-50">
        <PageHeader
          title="Dashboard"
          description={`Selamat datang, ${profile?.full_name || user?.email}`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </PageHeader>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:gap-6 mb-8">
          <StatCard icon={Boxes} label="Total Aset" value={stats.total} tone="indigo" />
          <StatCard icon={Wallet} label="Nilai Aset" value={formatRupiah(stats.nilai)} tone="emerald" />
          <StatCard icon={ArrowLeftRight} label="Sedang Dipinjam" value={stats.dipinjam} tone="amber" />
          <StatCard icon={AlertTriangle} label="Kondisi Rusak" value={stats.rusak} tone="rose" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Aset Terbaru</h3>
            <button onClick={() => router.push('/aset')} className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500">
              Lihat semua →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Kode', 'Nama Aset', 'Kategori', 'Kondisi', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asetTerbaru.map(a => (
                  <tr key={a.id} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">{a.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{a.name}</td>
                    <td className="px-6 py-4 text-slate-600">{a.category || '-'}</td>
                    <td className="px-6 py-4"><Badge label={a.condition} map={KONDISI_ASET} /></td>
                    <td className="px-6 py-4"><Badge label={a.status} map={STATUS_ASET} /></td>
                  </tr>
                ))}
              </tbody>
              {asetTerbaru.length === 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={Boxes}
                        title="Belum ada aset"
                        description="Mulai dengan menambahkan aset pertama perusahaan Anda."
                        action={
                          <button onClick={() => router.push('/aset/tambah')} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                            Tambah Aset
                          </button>
                        }
                      />
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
