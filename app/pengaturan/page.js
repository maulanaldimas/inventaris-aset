'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { UserRound, Building2 } from 'lucide-react'
import Sidebar from '../../components/sidebar'
import { PageHeader, btnPrimary, inputCls, labelCls, cardCls, mainCls } from '../../components/ui'
import { useProfile } from '../../lib/use-profile'
import { api } from '../../lib/api'
import { uploadFilePublic } from '../../lib/storage'

function FormProfil({ profile }) {
    const [form, setForm] = useState({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        job_title: profile.job_title || '',
    })
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
    const [fileAvatar, setFileAvatar] = useState(null)
    const [saving, setSaving] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = { ...form }
            if (fileAvatar) payload.avatar_url = await uploadFilePublic(fileAvatar, 'avatars')
            else if (avatarUrl) payload.avatar_url = avatarUrl

            await api.put('/api/profile', payload)
            toast.success('Profil berhasil diperbarui. Muat ulang halaman untuk melihat perubahan.')
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan profil')
        }
        setSaving(false)
    }

    return (
        <div className={`${cardCls} p-6`}>
            <div className="mb-5 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50">
                    <UserRound className="h-[18px] w-[18px] text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">Profil Saya</h2>
                    <p className="text-xs text-slate-500">{profile.id}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelCls}>Nama Lengkap</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} required className={inputCls} placeholder="Nama Anda" />
                </div>
                <div>
                    <label className={labelCls}>No. Telepon</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className={inputCls} placeholder="08xxxxxxxxxx" />
                </div>
                <div>
                    <label className={labelCls}>Jabatan</label>
                    <input name="job_title" value={form.job_title} onChange={handleChange} className={inputCls} placeholder="cth: Staf IT" />
                </div>
                <div>
                    <label className={labelCls}>Foto Profil</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFileAvatar(e.target.files[0])}
                        className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium`}
                    />
                </div>
                <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
            </form>
        </div>
    )
}

function FormPerusahaan({ profile }) {
    const company = profile.companies || {}
    const [form, setForm] = useState({
        name: company.name || '',
        primary_color: company.primary_color || '#4f46e5',
    })
    const [logoUrl, setLogoUrl] = useState(company.logo_url || '')
    const [fileLogo, setFileLogo] = useState(null)
    const [saving, setSaving] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!profile.company_id) return
        setSaving(true)
        try {
            const payload = { ...form }
            if (fileLogo) payload.logo_url = await uploadFilePublic(fileLogo, 'company-logos')
            else if (logoUrl) payload.logo_url = logoUrl

            await api.put('/api/company', payload)
            toast.success('Data perusahaan berhasil diperbarui.')
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan data perusahaan')
        }
        setSaving(false)
    }

    return (
        <div className={`${cardCls} p-6`}>
            <div className="mb-5 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50">
                    <Building2 className="h-[18px] w-[18px] text-violet-600" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">Perusahaan</h2>
                    <p className="text-xs text-slate-500">Nama, logo, dan warna brand</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelCls}>Nama Perusahaan</label>
                    <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Nama PT" />
                </div>
                <div>
                    <label className={labelCls}>Logo Perusahaan</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFileLogo(e.target.files[0])}
                        className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium`}
                    />
                </div>
                <div>
                    <label className={labelCls}>Warna Utama</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            name="primary_color"
                            value={form.primary_color}
                            onChange={handleChange}
                            className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                        />
                        <span className="text-sm font-mono text-slate-600">{form.primary_color}</span>
                    </div>
                </div>
                <button type="submit" disabled={saving || !profile.company_id} className={btnPrimary}>
                    {saving ? 'Menyimpan...' : 'Simpan Perusahaan'}
                </button>
            </form>
        </div>
    )
}

export default function PengaturanPage() {
    const router = useRouter()
    const { profile, loading } = useProfile()

    useEffect(() => {
        if (!loading && !profile) router.replace('/login')
    }, [loading, profile, router])

    return (
        <div className="flex">
            <Sidebar />
            <main className={mainCls}>
                <PageHeader
                    title="Pengaturan"
                    description="Kelola profil dan identitas perusahaan"
                />

                {profile ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <FormProfil key={`p-${profile.id}`} profile={profile} />
                        {profile.role === 'admin' && (
                            <FormPerusahaan key={`c-${profile.company_id || 'none'}`} profile={profile} />
                        )}
                    </div>
                ) : (
                    <div className={cardCls}>
                        <div className="animate-pulse space-y-4 p-6">
                            <div className="h-4 w-40 rounded bg-slate-100" />
                            <div className="h-10 w-full rounded-lg bg-slate-100" />
                            <div className="h-10 w-full rounded-lg bg-slate-100" />
                            <div className="h-10 w-full rounded-lg bg-slate-100" />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
