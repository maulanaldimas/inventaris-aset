'use client'

import { PackageOpen } from 'lucide-react'

export const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400'

export const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700'

export const cardCls = 'rounded-xl border border-slate-200 bg-white shadow-sm'

export const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-50'

export const btnSecondary =
    'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50'

export const btnDanger =
    'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:pointer-events-none disabled:opacity-50'

export const mainCls = 'ml-64 flex-1 p-6 md:p-8 min-h-screen bg-slate-50'

export function Badge({ label, map }) {
    if (!label) return <span className="text-sm text-slate-400">-</span>
    const cls = map?.[label] || 'bg-slate-100 text-slate-600 ring-slate-500/20'
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
            {label}
        </span>
    )
}

const toneMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-red-50 text-red-600',
}

export function StatCard({ icon: Icon, label, value, tone = 'indigo' }) {
    return (
        <div className={`${cardCls} p-5`}>
            <div className="flex items-center gap-4">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${toneMap[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="truncate text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    )
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100">
                <Icon className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (
        <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    )
}

export function PageHeader({ title, description, children }) {
    return (
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
    )
}
