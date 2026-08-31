'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Sidebar from '../../../components/sidebar'
import { inputCls, labelCls, btnPrimary, btnSecondary, cardCls, mainCls } from '../../../components/ui'
import { uploadFilePublic } from '../../../lib/storage'

const initialForm = {
    code: '',
    name: '',
    category: '',
    brand: '',
    condition: 'Baik',
    status: 'Tersedia',
    location_id: '',
    purchase_date: '',
    purchase_price: '',
    notes: '',
}

export default function TambahAsetPage() {
    const [formData, setFormData] = useState(initialForm)
    const [fileFoto, setFileFoto] = useState(null)
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await api.get('/api/locations')
                setLocations(data.locations.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')))
            } catch {
                toast.error('Gagal memuat lokasi')
            }
        }
        fetchLocations()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        let photoUrl = null
        if (fileFoto) {
            try {
                photoUrl = await uploadFilePublic(fileFoto, 'assets')
            } catch (err) {
                toast.error('Gagal upload foto: ' + err.message)
                setLoading(false)
                return
            }
        }

        try {
            await api.post('/api/assets', {
                ...formData,
                location_id: formData.location_id || null,
                purchase_date: formData.purchase_date || null,
                purchase_price: formData.purchase_price || null,
                photo_url: photoUrl,
            })
            toast.success('Aset berhasil ditambahkan')
            router.push('/aset')
            return
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan aset')
        }
        setLoading(false)
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <Link href="/aset" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-500">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Tambah Aset Baru</h1>
                        <p className="mt-1 text-sm text-slate-500">Lengkapi detail aset di bawah ini</p>
                    </div>

                    <form onSubmit={handleSubmit} className={`${cardCls} p-6 md:p-8 space-y-5`}>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="code" className={labelCls}>Kode Aset *</label>
                                <input id="code" type="text" name="code" value={formData.code} onChange={handleChange} placeholder="AST-001" className={inputCls} required />
                            </div>
                            <div>
                                <label htmlFor="name" className={labelCls}>Nama Aset *</label>
                                <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Laptop Dell Latitude" className={inputCls} required />
                            </div>
                            <div>
                                <label htmlFor="category" className={labelCls}>Kategori</label>
                                <input id="category" type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Elektronik" className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="brand" className={labelCls}>Merek</label>
                                <input id="brand" type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Dell" className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="condition" className={labelCls}>Kondisi</label>
                                <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className={inputCls}>
                                    <option>Baik</option>
                                    <option>Rusak</option>
                                    <option>Perbaikan</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className={labelCls}>Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                                    <option>Tersedia</option>
                                    <option>Dipinjam</option>
                                    <option>Rusak</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="location_id" className={labelCls}>Lokasi</label>
                                <select id="location_id" name="location_id" value={formData.location_id} onChange={handleChange} className={inputCls}>
                                    <option value="">Pilih lokasi...</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="purchase_date" className={labelCls}>Tanggal Beli</label>
                                <input id="purchase_date" type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="purchase_price" className={labelCls}>Harga Beli (Rp)</label>
                                <input id="purchase_price" type="number" min="0" step="any" name="purchase_price" value={formData.purchase_price} onChange={handleChange} placeholder="15000000" className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="photo" className={labelCls}>Foto Aset</label>
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFileFoto(e.target.files[0])}
                                    className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100`}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className={labelCls}>Catatan</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Catatan tambahan..." rows={3} className={inputCls} />
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                            <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 sm:flex-none`}>
                                <Save className="h-4 w-4" />
                                {loading ? 'Menyimpan...' : 'Simpan Aset'}
                            </button>
                            <Link href="/aset" className={`${btnSecondary} flex-1 sm:flex-none`}>
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
