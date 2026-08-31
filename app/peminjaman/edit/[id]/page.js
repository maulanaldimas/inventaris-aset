'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../../lib/api'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import Sidebar from '../../../../components/sidebar'
import { inputCls, labelCls, btnPrimary, btnSecondary, cardCls, mainCls } from '../../../../components/ui'
import { todayISO } from '../../../../lib/format'

export default function EditPeminjamanPage() {
    const params = useParams()
    const router = useRouter()
    const [formData, setFormData] = useState({
        borrower_name: '',
        department: '',
        borrow_date: '',
        return_date: '',
        returned_at: '',
        status: 'Dipinjam',
        notes: '',
        asset_id: '',
    })
    const [memuat, setMemuat] = useState(true)
    const [menyimpan, setMenyimpan] = useState(false)

    useEffect(() => {
        const fetchBorrowing = async () => {
            try {
                const data = await api.get(`/api/borrowings/${params.id}`)
                const b = data.borrowing
                setFormData({
                    borrower_name: b.borrower_name || '',
                    department: b.department || '',
                    borrow_date: b.borrow_date ? String(b.borrow_date).slice(0, 10) : '',
                    return_date: b.return_date ? String(b.return_date).slice(0, 10) : '',
                    returned_at: b.returned_at ? String(b.returned_at).slice(0, 10) : '',
                    status: b.status || 'Dipinjam',
                    notes: b.notes || '',
                    asset_id: b.asset_id,
                })
            } catch {
                toast.error('Gagal memuat data peminjaman')
            }
            setMemuat(false)
        }
        fetchBorrowing()
    }, [params.id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMenyimpan(true)

        try {
            await api.put(`/api/borrowings/${params.id}`, {
                borrower_name: formData.borrower_name,
                department: formData.department,
                borrow_date: formData.borrow_date,
                return_date: formData.return_date || null,
                returned_at: formData.status === 'Dikembalikan' ? (formData.returned_at || null) : null,
                status: formData.status,
                notes: formData.notes,
            })
            toast.success('Perubahan berhasil disimpan')
            router.push('/peminjaman')
            return
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan perubahan')
        }
        setMenyimpan(false)
    }

    const handleTandaiKembali = () => {
        setFormData(prev => ({ ...prev, status: 'Dikembalikan', returned_at: todayISO() }))
        toast.success('Status diubah menjadi Dikembalikan. Jangan lupa simpan.')
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
                        <Link href="/peminjaman" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-500">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Edit Peminjaman</h1>
                        <p className="mt-1 text-sm text-slate-500">Perbarui detail atau status pengembalian</p>
                    </div>

                    <form onSubmit={handleSubmit} className={`${cardCls} p-6 md:p-8 space-y-5`}>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="borrower_name" className={labelCls}>Nama Peminjam *</label>
                                <input id="borrower_name" type="text" name="borrower_name" value={formData.borrower_name} onChange={handleChange} className={inputCls} required />
                            </div>
                            <div>
                                <label htmlFor="department" className={labelCls}>Departemen</label>
                                <input id="department" type="text" name="department" value={formData.department} onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="borrow_date" className={labelCls}>Tanggal Pinjam</label>
                                <input id="borrow_date" type="date" name="borrow_date" value={formData.borrow_date} onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="return_date" className={labelCls}>Rencana Kembali</label>
                                <input id="return_date" type="date" name="return_date" value={formData.return_date} onChange={handleChange} className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="status" className={labelCls}>Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                                    <option value="Dipinjam">Dipinjam</option>
                                    <option value="Dikembalikan">Dikembalikan</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="returned_at" className={labelCls}>Tanggal Dikembalikan</label>
                                <input id="returned_at" type="date" name="returned_at" value={formData.returned_at} onChange={handleChange} className={inputCls} />
                            </div>
                        </div>

                        {formData.status === 'Dipinjam' && (
                            <button
                                type="button"
                                onClick={handleTandaiKembali}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Tandai Sudah Dikembalikan Hari Ini
                            </button>
                        )}

                        <div>
                            <label htmlFor="notes" className={labelCls}>Catatan</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputCls} />
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                            <button type="submit" disabled={menyimpan} className={`${btnPrimary} flex-1 sm:flex-none`}>
                                <Save className="h-4 w-4" />
                                {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
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
