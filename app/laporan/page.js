'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/sidebar'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function LaporanPage() {
    const [tab, setTab] = useState('aset')
    const [assets, setAssets] = useState([])
    const [borrowings, setBorrowings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data: assetData } = await supabase
            .from('assets')
            .select('*, locations(name)')
            .order('code', { ascending: true })

        const { data: borrowingData } = await supabase
            .from('borrowings')
            .select('*, assets(name, code)')
            .order('borrow_date', { ascending: false })

        setAssets(assetData || [])
        setBorrowings(borrowingData || [])
        setLoading(false)
    }

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
        }))
        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Aset')
        XLSX.writeFile(workbook, 'laporan-aset.xlsx')
    }

    const exportAsetPDF = () => {
        const doc = new jsPDF()
        doc.text('Laporan Aset', 14, 15)
        autoTable(doc, {
            startY: 20,
            head: [['Kode', 'Nama', 'Kategori', 'Kondisi', 'Status', 'Lokasi']],
            body: assets.map(a => [
                a.code, a.name, a.category, a.condition, a.status, a.locations?.name || '-'
            ]),
        })
        doc.save('laporan-aset.pdf')
    }

    // ===== EXPORT PEMINJAMAN =====
    const exportPeminjamanExcel = () => {
        const rows = borrowings.map(b => ({
            'Aset': b.assets?.name || '-',
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
    }

    const exportPeminjamanPDF = () => {
        const doc = new jsPDF()
        doc.text('Laporan Peminjaman', 14, 15)
        autoTable(doc, {
            startY: 20,
            head: [['Aset', 'Peminjam', 'Departemen', 'Tgl Pinjam', 'Status']],
            body: borrowings.map(b => [
                b.assets?.name || '-', b.borrower_name, b.department, b.borrow_date, b.status
            ]),
        })
        doc.save('laporan-peminjaman.pdf')
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Laporan</h1>
                    <p className="text-gray-600">Export data aset dan peminjaman</p>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('aset')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'aset' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                    >
                        Laporan Aset
                    </button>
                    <button
                        onClick={() => setTab('peminjaman')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'peminjaman' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                    >
                        Laporan Peminjaman
                    </button>
                </div>

                {tab === 'aset' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Laporan Aset ({assets.length} item)</h3>
                            <div className="flex gap-2">
                                <button onClick={exportAsetExcel} className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                    Export Excel
                                </button>
                                <button onClick={exportAsetPDF} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                                    Export PDF
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        {['Kode', 'Nama', 'Kategori', 'Kondisi', 'Status', 'Lokasi'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-700">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {assets.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-900">{a.code}</td>
                                            <td className="px-6 py-3 text-gray-900">{a.name}</td>
                                            <td className="px-6 py-3 text-gray-600">{a.category}</td>
                                            <td className="px-6 py-3 text-gray-600">{a.condition}</td>
                                            <td className="px-6 py-3 text-gray-600">{a.status}</td>
                                            <td className="px-6 py-3 text-gray-600">{a.locations?.name || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'peminjaman' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Laporan Peminjaman ({borrowings.length} data)</h3>
                            <div className="flex gap-2">
                                <button onClick={exportPeminjamanExcel} className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                    Export Excel
                                </button>
                                <button onClick={exportPeminjamanPDF} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                                    Export PDF
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        {['Aset', 'Peminjam', 'Departemen', 'Tgl Pinjam', 'Status'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-700">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {borrowings.map(b => (
                                        <tr key={b.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-900">{b.assets?.name || '-'}</td>
                                            <td className="px-6 py-3 text-gray-900">{b.borrower_name}</td>
                                            <td className="px-6 py-3 text-gray-600">{b.department}</td>
                                            <td className="px-6 py-3 text-gray-600">{b.borrow_date}</td>
                                            <td className="px-6 py-3 text-gray-600">{b.status}</td>
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