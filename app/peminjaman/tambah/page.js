'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Sidebar from '../../../components/sidebar'
import { inputCls, labelCls, btnPrimary, btnSecondary, cardCls, mainCls } from '../../../components/ui'
import { todayISO } from '../../../lib/format'

export default function TambahPeminjamanPage() {
    const [formData, setFormData] = useState({
        asset_id: '',
        borrower_name: '',
        department: '',
        borrow_date: todayISO(),
        return_date: '',
        status: 'Dipinjam',
        notes: '',
    })
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const data = await api.get('/api/assets')
                setAssets(
                    data.assets
                        .filter(a => a.status === 'Tersedia')
                        .sort((a, b) => (a.code || '').localeCompare(b.code || ''))
                )
            } catch {
                toast.error('Gagal memuat data aset')
            }
        }
        fetchAssets()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await api.post('/api/borrowings', {
                ...formData,
                return_date: formData.return_date || null,
            })
            toast.success('Peminjaman berhasil dicatat')
            router.push('/peminjaman')
            return
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan peminjaman')
        }
        setLoading(false)
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <Link href="/peminjaman" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-500">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Tambah Peminjaman</h1>
                        <p className="mt-1 text-sm text-slate-500">Catat aset yang sedang dipinjam</p>
                    </div>

                    <form onSubmit={handleSubmit} className={`${cardCls} p-6 md:p-8 space-y-5`}>
                        <div>
                            <label htmlFor="asset_id" className={labelCls}>Aset *</label>
                            <select id="asset_id" name="asset_id" value={formData.asset_id} onChange={handleChange} className={inputCls} required>
                                <option value="">Pilih aset...</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                                ))}
                            </select>
                            {assets.length === 0 && (
                                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                                    Tidak ada aset berstatus &quot;Tersedia&quot; saat ini.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="borrower_name" className={labelCls}>Nama Peminjam *</label>
                                <input id="borrower_name" type="text" name="borrower_name" value={formData.borrower_name} onChange={handleChange} placeholder="Nama lengkap" className={inputCls} required />
                            </div>
                            <div>
                                <label htmlFor="department" className={labelCls}>Departemen</label>
                                <input id="department" type="text" name="department" value={formData.department} onChange={handleChange} placeholder="IT, HR, dll" className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="borrow_date" className={labelCls}>Tanggal Pinjam *</label>
                                <input id="borrow_date" type="date" name="borrow_date" value={formData.borrow_date} onChange={handleChange} className={inputCls} required />
                            </div>
                            <div>
                                <label htmlFor="return_date" className={labelCls}>Rencana Kembali</label>
                                <input id="return_date" type="date" name="return_date" value={formData.return_date} onChange={handleChange} className={inputCls} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className={labelCls}>Catatan</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Keperluan peminjaman..." rows={3} className={inputCls} />
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                            <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 sm:flex-none`}>
                                <Save className="h-4 w-4" />
                                {loading ? 'Menyimpan...' : 'Simpan Peminjaman'}
                            </button>
                            <Link href="/peminjaman" className={`${btnSecondary} flex-1 sm:flex-none`}>
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
