'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../../components/sidebar'

export default function EditAsetPage() {
    const params = useParams()
    const [formData, setFormData] = useState({ code: '', name: '', category: '', brand: '', condition: 'Baik', status: 'Tersedia', location_id: '', notes: '', })
    const [fileFoto, setFileFoto] = useState(null)
    const [mengupload, setMengupload] = useState(false)
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        // Ambil lokasi
        const { data: locs } = await supabase.from('locations').select('*')
        setLocations(locs || [])

        // Ambil aset berdasarkan ID
        const { data: asset } = await supabase
            .from('assets')
            .select('*')
            .eq('id', params.id)
            .single()

        if (asset) {
            setFormData(asset)
        }
        setLoading(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMengupload(true)

        let photoUrl = formData.photo_url

        if (fileFoto) {
            // Hapus foto lama kalau ada
            if (formData.photo_url) {
                const namaFileLama = formData.photo_url.split('/asset-photos/')[1]
                if (namaFileLama) {
                    await supabase.storage.from('asset-photos').remove([namaFileLama])
                }
            }

            const namaFileBaru = `${Date.now()}-${fileFoto.name}`
            const { error: errorUpload } = await supabase.storage
                .from('asset-photos')
                .upload(namaFileBaru, fileFoto)

            if (errorUpload) {
                alert('Gagal upload foto: ' + errorUpload.message)
                setLoading(false)
                setMengupload(false)
                return
            }

            const { data: urlData } = supabase.storage
                .from('asset-photos')
                .getPublicUrl(namaFileBaru)

            photoUrl = urlData.publicUrl
        }

        const dataToSubmit = {
            ...formData,
            purchase_date: formData.purchase_date || null,
            purchase_price: formData.purchase_price || null,
            photo_url: photoUrl,
        }

        const { error } = await supabase
            .from('assets')
            .update(dataToSubmit)
            .eq('id', params.id)

        if (error) {
            alert('Error: ' + error.message)
        } else {
            router.push('/aset')
        }
        setLoading(false)
        setMengupload(false)
    }

    if (loading) return <p>Memuat...</p>

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <Link href="/aset" className="text-blue-600 hover:text-blue-800"> ← Kembali </Link>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">Edit Aset</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Aset</label>
                                <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aset</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
                                <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" >
                                    <option>Baik</option>
                                    <option>Rusak</option>
                                    <option>Perbaikan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" >
                                    <option>Tersedia</option>
                                    <option>Dipinjam</option>
                                    <option>Rusak</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Aset</label>
                            {formData.photo_url && (
                                <img src={formData.photo_url} alt={formData.name} className="w-24 h-24 object-cover rounded-lg mb-2" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFileFoto(e.target.files[0])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                            <select name="location_id" value={formData.location_id || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" >
                                <option value="">Pilih lokasi...</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400" >
                                {mengupload ? 'Mengupload foto...' : loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                            <Link href="/aset" className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg text-center hover:bg-gray-400 font-medium" >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}