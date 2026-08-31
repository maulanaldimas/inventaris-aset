'use client'

import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import Sidebar from '../../components/sidebar'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import { Badge, PageHeader, mainCls, cardCls } from '../../components/ui'
import { STATUS_ASET, KONDISI_ASET, STATUS_PEMINJAMAN } from '../../lib/constants'
import { formatRupiah, formatDate } from '../../lib/format'

export default function LaporanPage() {
    const [tab, setTab] = useState('aset')
    const [assets, setAssets] = useState([])
    const [borrowings, setBorrowings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dataAset, dataPinjam] = await Promise.all([
                    api.get('/api/assets'),
                    api.get('/api/borrowings'),
                ])
                setAssets(dataAset.assets.slice().sort((a, b) => (a.code || '').localeCompare(b.code || '')))
                setBorrowings(
                    dataPinjam.borrowings
                        .slice()
                        .sort((a, b) => (b.borrow_date || '').localeCompare(a.borrow_date || ''))
                )
            } catch {
                toast.error('Gagal memuat data laporan')
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    // ===== EXPORT ASET =====
    const exportAsetExcel = () => {
        const rows = assets.map(a => ({
            'Kode': a.code,
            'Nama': a.name,
            'Kategori': a.category,
            'Merek': a.brand,
            'Kondisi': a.condition,
            'Status': a.status,
            'Lokasi': a.locations?.name || '-',
            'Harga Beli (Rp)': Number(a.purchase_price) || 0,
        }))
        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Aset')
        XLSX.writeFile(workbook, 'laporan-aset.xlsx')
        toast.success('Laporan Excel berhasil diunduh')
    }

    const exportAsetPDF = () => {
        const doc = new jsPDF()
        doc.text('Laporan Aset', 14, 15)
        autoTable(doc, {
            startY: 20,
            head: [['Kode', 'Nama', 'Kategori', 'Kondisi', 'Status', 'Lokasi', 'Harga Beli']],
            body: assets.map(a => [
                a.code, a.name, a.category || '-', a.condition, a.status, a.locations?.name || '-',
                formatRupiah(a.purchase_price),
            ]),
        })
        doc.save('laporan-aset.pdf')
        toast.success('Laporan PDF berhasil diunduh')
    }

    // ===== EXPORT PEMINJAMAN =====
    const exportPeminjamanExcel = () => {
        const rows = borrowings.map(b => ({
            'Aset': b.assets?.name || '-',
            'Kode Aset': b.assets?.code || '-',
            'Peminjam': b.borrower_name,
            'Departemen': b.department,
            'Tgl Pinjam': b.borrow_date,
            'Rencana Kembali': b.return_date,
            'Tgl Dikembalikan': b.returned_at || '-',
            'Status': b.status,
        }))
        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Peminjaman')
        XLSX.writeFile(workbook, 'laporan-peminjaman.xlsx')
        toast.success('Laporan Excel berhasil diunduh')
    }

    const exportPeminjamanPDF = () => {
        const doc = new jsPDF()
        doc.text('Laporan Peminjaman', 14, 15)
        autoTable(doc, {
            startY: 20,
            head: [['Aset', 'Peminjam', 'Departemen', 'Tgl Pinjam', 'Status']],
            body: borrowings.map(b => [
                b.assets?.name || '-', b.borrower_name, b.department || '-', b.borrow_date, b.status
            ]),
        })
        doc.save('laporan-peminjaman.pdf')
        toast.success('Laporan PDF berhasil diunduh')
    }

    const tabBtn = (value, label) => (
        <button
            onClick={() => setTab(value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                tab === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            {label}
        </button>
    )

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <PageHeader title="Laporan" description="Ekspor data aset dan peminjaman ke Excel atau PDF" />

                <div className="mb-6 inline-flex rounded-lg bg-slate-100 p-1">
                    {tabBtn('aset', `Aset (${assets.length})`)}
                    {tabBtn('peminjaman', `Peminjaman (${borrowings.length})`)}
                </div>

                {loading ? (
                    <div className={`${cardCls} grid place-items-center p-16`}>
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                            <p className="text-sm text-slate-500">Menyiapkan laporan...</p>
                        </div>
                    </div>
                ) : tab === 'aset' ? (
                    <div className={`${cardCls} overflow-hidden`}>
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-slate-900">Rekap Aset</h3>
                            <div className="flex gap-2">
                                <button onClick={exportAsetExcel} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500">
                                    Excel
                                </button>
                                <button onClick={exportAsetPDF} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500">
                                    PDF
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>{['Kode', 'Nama', 'Kategori', 'Kondisi', 'Status', 'Lokasi', 'Harga Beli'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {assets.map(a => (
                                        <tr key={a.id} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900">{a.code}</td>
                                            <td className="px-5 py-3.5 font-medium text-slate-900">{a.name}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{a.category || '-'}</td>
                                            <td className="px-5 py-3.5"><Badge label={a.condition} map={KONDISI_ASET} /></td>
                                            <td className="px-5 py-3.5"><Badge label={a.status} map={STATUS_ASET} /></td>
                                            <td className="px-5 py-3.5 text-slate-600">{a.locations?.name || '-'}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-900">{formatRupiah(a.purchase_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className={`${cardCls} overflow-hidden`}>
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-slate-900">Rekap Peminjaman</h3>
                            <div className="flex gap-2">
                                <button onClick={exportPeminjamanExcel} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500">
                                    Excel
                                </button>
                                <button onClick={exportPeminjamanPDF} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500">
                                    PDF
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>{['Aset', 'Peminjam', 'Tgl Pinjam', 'Rencana Kembali', 'Status'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {borrowings.map(b => (
                                        <tr key={b.id} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5 font-medium text-slate-900">{b.assets?.name || '-'}</td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-slate-900">{b.borrower_name}</p>
                                                <p className="text-xs text-slate-400">{b.department || '-'}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">{formatDate(b.borrow_date)}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{formatDate(b.return_date)}</td>
                                            <td className="px-5 py-3.5"><Badge label={b.status} map={STATUS_PEMINJAMAN} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
