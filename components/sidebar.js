'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
    const pathname = usePathname()
    const menu = [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '📦', label: 'Aset', href: '/aset' },
        { icon: '📍', label: 'Lokasi', href: '/lokasi' },
        { icon: '🔄', label: 'Peminjaman', href: '/peminjaman' },
        { icon: '📄', label: 'Laporan', href: '/laporan' },
    ]
    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold">📦 Inventaris</h1>
                <p className="text-sm text-gray-400">Manajemen Aset</p>
            </div>
            <nav className="mt-6">
                {menu.map(item => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-6 py-3 transition ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}