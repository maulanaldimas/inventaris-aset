'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { btnSecondary } from './ui'

const ConfirmContext = createContext(() => Promise.resolve(false))

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null)
    const resolveRef = useRef(null)

    const konfirmasi = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve
            setDialog({
                title: 'Yakin?',
                message: '',
                confirmText: 'Ya, Lanjutkan',
                tone: 'danger',
                ...options,
            })
        })
    }, [])

    const tutup = (result) => {
        setDialog(null)
        resolveRef.current?.(result)
        resolveRef.current = null
    }

    return (
        <ConfirmContext.Provider value={konfirmasi}>
            {children}
            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => tutup(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <div
                            className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${
                                dialog.tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                            }`}
                        >
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-center text-base font-semibold text-slate-900">{dialog.title}</h2>
                        {dialog.message && (
                            <p className="mt-1.5 text-center text-sm text-slate-500">{dialog.message}</p>
                        )}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => tutup(false)} className={btnSecondary}>
                                Batal
                            </button>
                            <button
                                autoFocus
                                onClick={() => tutup(true)}
                                className={
                                    dialog.tone === 'danger'
                                        ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500'
                                        : 'inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500'
                                }
                            >
                                {dialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    )
}

export function useKonfirmasi() {
    return useContext(ConfirmContext)
}
