'use client'

import { useState } from 'react'
import { api } from '../../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Sidebar from '../../../components/sidebar'
import { inputCls, labelCls, btnPrimary, btnSecondary, cardCls, mainCls } from '../../../components/ui'

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
        try {
            await api.post('/api/locations', formData)
            toast.success('Lokasi berhasil ditambahkan')
            router.push('/lokasi')
            return
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan lokasi')
        }
        setLoading(false)
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <Link href="/lokasi" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-500">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Tambah Lokasi Baru</h1>
                        <p className="mt-1 text-sm text-slate-500">Daftarkan ruang atau area penyimpanan aset</p>
                    </div>

                    <form onSubmit={handleSubmit} className={`${cardCls} p-6 md:p-8 space-y-5`}>
                        <div>
                            <label htmlFor="name" className={labelCls}>Nama Lokasi *</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ruang Server IT" className={inputCls} required />
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="building" className={labelCls}>Gedung</label>
                                <input id="building" type="text" name="building" value={formData.building} onChange={handleChange} placeholder="Gedung A" className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="floor" className={labelCls}>Lantai</label>
                                <input id="floor" type="text" name="floor" value={formData.floor} onChange={handleChange} placeholder="Lantai 3" className={inputCls} />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                            <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 sm:flex-none`}>
                                <Save className="h-4 w-4" />
                                {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
                            </button>
                            <Link href="/lokasi" className={`${btnSecondary} flex-1 sm:flex-none`}>
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
