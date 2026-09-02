# 📦 Inventaris Aset

Sistem manajemen aset perusahaan multi-tenant berbasis web: pencatatan aset, lokasi penyimpanan, peminjaman, label QR code, riwayat aktivitas (audit trail), dan laporan siap ekspor. Dibangun dengan Next.js + PostgreSQL (Prisma), dikemas dalam Docker.

> **Demo live:** https://itsokkalink.tailbc5ae7.ts.net/inventaris
>
> **Login admin demo:** `admin@example.com` / `admin12345`
>
> > Demo ini di-hosting dari komputer pribadi (Docker + Tailscale Funnel + Caddy) dan hanya aktif saat server daring.

## Fitur

- **Dashboard** — ringkasan jumlah aset, total nilai aset (Rp), aset yang sedang dipinjam, dan kondisi rusak.
- **Multi-Tenant** — beberapa perusahaan dalam satu aplikasi; semua data terisolasi per perusahaan dan diverifikasi di setiap API route (bukan hanya di UI).
- **Manajemen Aset** — CRUD aset lengkap dengan kategori, merek, kondisi, status, harga beli, foto, dan catatan.
- **Pencarian & Filter** — cari aset berdasarkan nama/kode, filter berdasarkan status.
- **Lokasi Penyimpanan** — kelola gedung/lantai/ruang sebagai tempat aset.
- **Peminjaman Aset** — catat peminjam, departemen, tanggal pinjam/kembali; status aset otomatis diperbarui saat dipinjam dan dikembalikan (transaksional).
- **Riwayat Aktivitas** — audit trail otomatis server-side (admin-only) untuk setiap pembuatan, perubahan, penghapusan, peminjaman, dan pengembalian.
- **Pengaturan** — kelola profil (nama, telepon, jabatan, foto) serta identitas perusahaan (nama, logo, warna utama).
- **Label QR Code** — generate QR per aset atau cetak massal; hasil scan menampilkan detail aset dalam halaman publik tanpa login.
- **Laporan Ekspor** — unduh rekap aset & peminjaman ke Excel (.xlsx) dan PDF.
- **Autentikasi Sendiri** — login email/password (bcrypt) dengan session JWT httpOnly; middleware memverifikasi sesi di edge.
- **Kontrol Akses Berlapis** — role admin/staff di UI *dan* ditegakkan server-side (mutasi hanya oleh admin, selalu ter-scope perusahaan sendiri).

## Teknologi

| Teknologi | Keterangan |
| --- | --- |
| [Next.js 16](https://nextjs.org) | App Router + Route Handlers (API) |
| [PostgreSQL 16](https://www.postgresql.org) | Database |
| [Prisma](https://www.prisma.io) | ORM & migrasi |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Lucide Icons](https://lucide.dev) | Ikon |
| [react-hot-toast](https://react-hot-toast.com) | Notifikasi |
| [qrcode.react](https://github.com/zpao/qrcode.react) | Generate QR code |
| [jose](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Session JWT & hashing password |
| [SheetJS (xlsx)](https://sheetjs.com), [jsPDF + AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Ekspor laporan |

## Memulai (Development)

### 1. Prasyarat

- Node.js 18+
- Docker Desktop (untuk database lokal)

### 2. Instalasi

```bash
git clone <url-repo>
cd inventaris-aset
npm install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env   # Windows: copy .env.example .env
```

Sesuaikan `DB_PASSWORD` (harus sama untuk `DATABASE_URL` dan docker compose) serta `SESSION_SECRET`.

### 4. Nyalakan Database + Migrasi + Seed

```bash
npm run db:up      # nyalakan PostgreSQL di Docker
npm run db:setup   # jalankan migrasi + buat perusahaan & admin default
```

Admin default dibuat dari variabel `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` di `.env` (default `admin@example.com` / `admin12345`). Seeder idempoten — aman dijalankan berulang.

### 5. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), login dengan akun admin.

## Deploy

### Docker Compose (VPS/server sendiri)

```bash
cp .env.example .env    # isi DB_PASSWORD & SESSION_SECRET
docker compose up -d --build
```

Aplikasi jalan di port 3000. Container menjalankan migrasi + seed otomatis saat start. Upload tersimpan di volume `uploads_data`.

### Railway

1. Buat project baru dari repo GitHub ini.
2. Tambahkan plugin **PostgreSQL**.
3. Set variabel: `DATABASE_URL` (dari plugin, tambah `?schema=public` bila perlu) dan `SESSION_SECRET`.
4. Railway otomatis build via `Dockerfile` (lihat `railway.json`) dan healthcheck `/login`.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server development |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan build produksi |
| `npm run lint` | ESLint |
| `npm run db:up` | Nyalakan PostgreSQL (docker compose) |
| `npm run db:deploy` | Terapkan migrasi Prisma |
| `npm run db:seed` | Buat perusahaan & admin default (idempoten) |
| `npm run db:setup` | `db:deploy` + `db:seed` |

## Struktur Proyek

```
app/
├── page.js              # Redirect ke /dashboard
├── api/                 # Route handlers (REST API)
│   ├── auth/            # login, logout, me
│   ├── assets/          # CRUD aset (+ [id])
│   ├── locations/       # CRUD lokasi (+ [id])
│   ├── borrowings/      # CRUD peminjaman (+ [id], transaksional)
│   ├── activity/        # Audit trail (admin)
│   ├── upload/          # Upload file ke public/uploads
│   └── scan/[id]/       # Endpoint publik hasil scan QR
├── login/               # Halaman autentikasi
├── dashboard/           # Ringkasan statistik
├── aset/                # Daftar, tambah, edit, QR per aset, QR massal
├── lokasi/              # Daftar, tambah, edit lokasi
├── peminjaman/          # Daftar, tambah, edit peminjaman
├── laporan/             # Ekspor Excel/PDF
├── aktivitas/           # Audit trail (admin-only)
├── pengaturan/          # Profil & identitas perusahaan
└── scan/[id]/           # Halaman publik hasil scan QR
components/
├── sidebar.js           # Navigasi utama + branding perusahaan
├── ui.jsx               # Design system kecil (badge, kartu, tombol)
├── confirm.jsx          # Dialog konfirmasi global
└── providers.jsx        # Provider toast + konfirmasi
lib/
├── db.js                # Client Prisma (singleton)
├── auth.js              # Session JWT + guard requireSession/requireAdmin
├── api.js               # Helper fetch klien
├── log.js               # Pencatatan audit trail server-side
├── dates.js             # Util tanggal (YYYY-MM-DD → Date)
├── format.js            # Format rupiah & tanggal (id-ID)
├── constants.js         # Pemetaan warna badge status
├── storage.js           # Helper upload file
└── use-profile.js       # Hook profil + perusahaan user aktif
prisma/
├── schema.prisma        # Model data
└── migrations/          # Migrasi SQL
scripts/
└── seed.js              # Seed perusahaan & admin
proxy.js                 # Middleware proteksi halaman (verifikasi JWT)
Dockerfile               # Image produksi (node:22-alpine)
docker-compose.yml       # db PostgreSQL + web
railway.json             # Konfigurasi deploy Railway
```

## Alur Bisnis Utama

1. **Pendaftaran aset**: admin mengisi kode unik (mis. `AST-001`), detail, dan lokasi — opsional unggah foto.
2. **Peminjaman**: staff mencatat peminjaman dari daftar aset berstatus *Tersedia*; status aset otomatis berubah menjadi *Dipinjam* (satu transaksi DB).
3. **Pengembalian**: ubah status menjadi *Dikembalikan* — status aset kembali *Tersedia* dan waktu kembali tercatat otomatis.
4. **Audit**: setiap aksi tercatat di menu **Aktivitas** (siapa, kapan, apa).
5. **Audit fisik**: cetak label QR, tempel pada aset; siapa pun dapat memindai untuk melihat kondisi & lokasi aset secara transparan.

## Keamanan

- Password di-hash dengan bcrypt; session JWT httpOnly (8 jam) ditandatangani `SESSION_SECRET`.
- Semua endpoint API memverifikasi session; mutasi (tambah/ubah/hapus) hanya untuk admin.
- Setiap query ter-scope `companyId` dari session — user tidak dapat membaca/melihat data perusahaan lain meski tahu ID-nya.
- Upload dibatasi jenis folder & ukuran maks 5MB; nama file disanitasi.
