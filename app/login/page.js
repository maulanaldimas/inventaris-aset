'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Boxes, Eye, EyeOff } from 'lucide-react'
import { api } from '../../lib/api'
import { btnPrimary, inputCls, labelCls } from '../../components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email dan password harus diisi')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/login', { email, password })
      toast.success('Berhasil masuk')
      router.replace('/dashboard')
    } catch (err) {
      setError(err.message || 'Email atau password salah')
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-50 via-white to-violet-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30">
              <Boxes className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Inventaris Aset</h1>
            <p className="mt-1 text-sm text-slate-500">Masuk untuk mengelola aset perusahaan</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputCls} pr-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">Sistem Inventaris Aset Perusahaan</p>
      </div>
    </div>
  )
}
