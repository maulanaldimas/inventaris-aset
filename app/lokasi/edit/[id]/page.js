'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../../lib/api'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Sidebar from '../../../../components/sidebar'
import { inputCls, labelCls, btnPrimary, btnSecondary, cardCls, mainCls } from '../../../../components/ui'

export default function EditLokasiPage() {
    const [formData, setFormData] = useState({ name: '', building: '', floor: '' })
    const [memuat, setMemuat] = useState(true)
    const [menyimpan, setMenyimpan] = useState(false)
    const router = useRouter()
    const params = useParams()

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const data = await api.get(`/api/locations/${params.id}`)
                const loc = data.location
                setFormData({ name: loc.name, building: loc.building || '', floor: loc.floor || '' })
            } catch {
                toast.error('Gagal memuat data lokasi')
            }
            setMemuat(false)
        }
        fetchLocation()
    }, [params.id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMenyimpan(true)
        try {
            await api.put(`/api/locations/${params.id}`, formData)
            toast.success('Perubahan berhasil disimpan')
            router.push('/lokasi')
            return
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan perubahan')
        }
        setMenyimpan(false)
    }

    if (memuat) {
        return (
            <div className="flex">
                <Sidebar />
                <main className={`${mainCls} grid place-items-center`}>
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                </main>
            </div>
        )
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
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Edit Lokasi</h1>
                        <p className="mt-1 text-sm text-slate-500">Perbarui detail lokasi penyimpanan</p>
                    </div>

                    <form onSubmit={handleSubmit} className={`${cardCls} p-6 md:p-8 space-y-5`}>
                        <div>
                            <label htmlFor="name" className={labelCls}>Nama Lokasi *</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} required />
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="building" className={labelCls}>Gedung</label>
                                <input id="building" type="text" name="building" value={formData.building} onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="floor" className={labelCls}>Lantai</label>
                                <input id="floor" type="text" name="floor" value={formData.floor} onChange={handleChange} className={inputCls} />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                            <button type="submit" disabled={menyimpan} className={`${btnPrimary} flex-1 sm:flex-none`}>
                                <Save className="h-4 w-4" />
                                {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
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
