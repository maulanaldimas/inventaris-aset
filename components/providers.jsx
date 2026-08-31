'use client'

import { Toaster } from 'react-hot-toast'
import { ConfirmProvider } from './confirm'

export default function Providers({ children }) {
    return (
        <ConfirmProvider>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#0f172a',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                }}
            />
        </ConfirmProvider>
    )
}
