import './globals.css'
import Providers from '../components/providers'

export const metadata = {
  applicationName: 'Inventaris Aset',
  title: {
    default: 'Inventaris Aset',
    template: '%s · Inventaris Aset',
  },
  description:
    'Sistem manajemen aset perusahaan: pencatatan aset, lokasi penyimpanan, peminjaman, label QR code, dan laporan siap ekspor.',
}

export const viewport = {
  themeColor: '#4f46e5',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
