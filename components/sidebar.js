'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Boxes,
    MapPin,
    ArrowLeftRight,
    FileBarChart,
    History,
    Settings,
    LogOut,
    Package,
} from 'lucide-react'
import { api } from '../lib/api'
import { useProfile } from '../lib/use-profile'

const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Boxes, label: 'Aset', href: '/aset' },
    { icon: MapPin, label: 'Lokasi', href: '/lokasi' },
    { icon: ArrowLeftRight, label: 'Peminjaman', href: '/peminjaman' },
    { icon: FileBarChart, label: 'Laporan', href: '/laporan' },
    { icon: History, label: 'Aktivitas', href: '/aktivitas' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { profile } = useProfile()

    const company = profile?.companies
    const isAdmin = profile?.role === 'admin'

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout')
        } finally {
            router.replace('/login')
        }
    }

    return (
        <div className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900">
            <div className="flex items-center gap-3 px-5 pb-4 pt-6">
                {company?.logo_url ? (
                    <Image
                        src={company.logo_url}
                        alt={company.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                ) : (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight text-white">
                        {company?.name || 'Inventaris Aset'}
                    </p>
                    <p className="text-[11px] text-slate-400">Manajemen Aset Perusahaan</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                {menu.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Icon className="h-[18px] w-[18px]" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="space-y-1 border-t border-white/10 p-3">
                <Link
                    href="/pengaturan"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        pathname.startsWith('/pengaturan')
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <Settings className="h-[18px] w-[18px]" />
                    Pengaturan
                </Link>

                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                    {profile?.avatar_url ? (
                        <Image
                            src={profile.avatar_url}
                            alt={profile.full_name || 'User'}
                            width={32}
                            height={32}
                            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white/10"
                        />
                    ) : (
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                            {(profile?.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white">
                            {profile?.full_name || 'Pengguna'}
                        </p>
                        <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                isAdmin ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-slate-300'
                            }`}
                        >
                            {isAdmin ? 'Admin' : 'Staff'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    Keluar
                </button>
            </div>
        </div>
    )
}
