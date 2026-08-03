import './globals.css'

export const metadata = {
  title: 'Inventaris Aset',
  description: 'Sistem Manajemen Aset Perusahaan',
}

export default function RootLayout({ children }) {
  return (
  <html lang="id">
    <body>{children}</body>
    </html>
    )
  }