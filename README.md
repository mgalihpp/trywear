# TryWear

Platform e-commerce modern dengan fitur **Virtual Try-On** berbasis AI yang memungkinkan pengguna mencoba pakaian secara virtual menggunakan teknologi pose estimation.

---

## Deskripsi

TryWear adalah aplikasi toko online lengkap yang dibangun dengan arsitektur monorepo menggunakan Turborepo. Proyek ini menggabungkan fitur e-commerce standar seperti manajemen produk, keranjang belanja, checkout, dan pembayaran dengan teknologi inovatif Virtual Try-On. Fitur ini memanfaatkan MediaPipe Pose untuk mendeteksi postur tubuh pengguna secara real-time dan menampilkan pakaian secara virtual mengikuti gerakan lengan dan posisi tubuh.

---

## Fitur Utama

### Storefront
- Katalog produk dengan kategori dan varian (ukuran, warna)
- Pencarian dan filter produk
- Keranjang belanja dengan persistensi data
- Wishlist untuk menyimpan produk favorit
- Sistem ulasan dan rating produk
- Virtual Try-On berbasis pose estimation untuk pakaian

### Checkout dan Pembayaran
- Manajemen alamat pengiriman
- Integrasi payment gateway Midtrans
- Sistem kupon dan diskon
- Notifikasi status pesanan

### Admin Dashboard
- Manajemen produk, kategori, dan supplier
- Manajemen inventori dan stok
- Pemrosesan pesanan dan pengiriman
- Manajemen pengembalian barang
- Segmentasi pelanggan
- Laporan penjualan dan audit log

### Sistem Autentikasi
- Login/Register dengan email
- OAuth provider support
- Manajemen role (admin/user)
- Session management

---

## Tech Stack

### Frontend (apps/web)
| Teknologi | Kegunaan |
|-----------|----------|
| Next.js 15 | Framework React dengan App Router |
| React 19 | Library UI |
| TanStack Query | State management dan data fetching |
| TanStack Table | Komponen tabel dengan fitur sorting/filter |
| Zustand | Client-side state management |
| React Hook Form + Zod | Form handling dan validasi |
| MediaPipe Pose | Pose estimation untuk Virtual Try-On |
| Recharts | Visualisasi data dashboard |
| Better Auth | Autentikasi |
| Uploadthing | Upload file/gambar |

### Backend (apps/server)
| Teknologi | Kegunaan |
|-----------|----------|
| Express 5 | HTTP server dan routing |
| Prisma | ORM dan database management |
| PostgreSQL | Database utama |
| Midtrans SDK | Payment gateway integration |
| Zod | Validasi request/response |
| Swagger | API documentation |

### Shared Packages
| Package | Kegunaan |
|---------|----------|
| @repo/db | Prisma client dan konfigurasi database |
| @repo/ui | Komponen UI reusable (shadcn/ui) |
| @repo/schema | Zod schema untuk validasi data |
| @repo/midtrans | Wrapper Midtrans payment |
| @repo/typescript-config | Konfigurasi TypeScript bersama |

### Tooling
- **Turborepo** - Monorepo build system
- **pnpm** - Package manager
- **Biome** - Linting dan formatting
- **TypeScript** - Type safety

---

## Struktur Folder

```
toko-online/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── app/                # App Router pages
│   │   │   ├── (admin)/        # Admin dashboard routes
│   │   │   ├── (auth)/         # Authentication routes
│   │   │   ├── (store)/        # Storefront routes
│   │   │   └── api/            # API routes
│   │   ├── components/         # Shared components
│   │   ├── features/           # Feature-based modules
│   │   │   ├── admin/          # Admin dashboard features
│   │   │   ├── cart/           # Keranjang belanja
│   │   │   ├── checkout/       # Proses checkout
│   │   │   ├── order/          # Manajemen pesanan
│   │   │   ├── product/        # Katalog dan Virtual Try-On
│   │   │   └── ...
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utilities dan konfigurasi
│   │
│   └── server/                 # Backend Express
│       ├── configs/            # Konfigurasi aplikasi
│       ├── middleware/         # Express middlewares
│       ├── modules/            # Feature modules (controller/service)
│       │   ├── address/
│       │   ├── order/
│       │   ├── payment/
│       │   ├── product/
│       │   └── ...
│       ├── routes/             # Route definitions
│       └── utils/              # Helper functions
│
├── packages/
│   ├── database/               # Prisma schema dan client
│   ├── midtrans/               # Midtrans SDK wrapper
│   ├── schema/                 # Shared Zod schemas
│   ├── typescript-config/      # Shared TS configs
│   └── ui/                     # Shared UI components
│
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace config
└── biome.json                  # Biome linter config
```

---

## Instalasi

### Prasyarat
- Node.js >= 18
- pnpm >= 10.18
- PostgreSQL database

### Langkah Instalasi

1. Clone repository
```bash
git clone https://github.com/mgalihpp/toko-online.git
cd toko-online
```

2. Install dependencies
```bash
pnpm install
```

3. Setup environment variables

Buat file `.env` di root, `apps/web`, dan `apps/server` dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trywear"
DIRECT_URL="postgresql://user:password@localhost:5432/trywear"

# Auth
BETTER_AUTH_SECRET="your-secret-key"

# Midtrans
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"

# Uploadthing
UPLOADTHING_TOKEN="your-uploadthing-token"
```

4. Generate Prisma client dan jalankan migrasi
```bash
cd packages/database
pnpm db:generate
pnpm db:migrate
```

---

## Cara Menjalankan

### Development Mode

Jalankan seluruh aplikasi secara bersamaan:
```bash
pnpm dev
```

Atau jalankan aplikasi tertentu:
```bash
# Frontend saja
pnpm dev --filter=web

# Backend saja
pnpm dev --filter=server
```

### Build Production

```bash
pnpm build
```

### Akses Aplikasi

| Aplikasi | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/api-docs |

---

## Contoh Penggunaan

### Virtual Try-On

1. Buka halaman detail produk pakaian
2. Klik tombol "Coba Virtual" atau ikon kamera
3. Izinkan akses webcam
4. Posisikan tubuh agar terdeteksi oleh sistem
5. Pakaian akan ditampilkan secara virtual mengikuti postur tubuh

### Checkout Flow

1. Tambahkan produk ke keranjang
2. Buka halaman keranjang dan lanjutkan ke checkout
3. Pilih atau tambahkan alamat pengiriman
4. Terapkan kupon jika tersedia
5. Pilih metode pembayaran dan selesaikan transaksi

---

## Catatan dan Limitasi

- **Virtual Try-On** saat ini optimal untuk pakaian atasan (kaos, kemeja). Dukungan untuk pakaian bawahan masih dalam pengembangan.
- Fitur Virtual Try-On memerlukan pencahayaan yang memadai dan latar belakang yang tidak terlalu ramai untuk deteksi pose yang akurat.
- Payment gateway menggunakan mode sandbox Midtrans untuk development. Konfigurasi production memerlukan kredensial terpisah.
- Upload gambar produk memerlukan konfigurasi Uploadthing yang valid.
- Database diasumsikan menggunakan PostgreSQL dengan koneksi pooling (Prisma Accelerate compatible).

---

## Rencana Pengembangan

- [ ] Memperbagus Virtual Try-On untuk pakaian atas
- [ ] Integrasi multiple payment gateway
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support
- [ ] Real-time notification dengan WebSocket
- [ ] Integrasi ekspedisi pengiriman (JNE, J&T, SiCepat)
- [ ] Mobile app dengan React Native

---

## Lisensi

Proyek ini bersifat privat dan tidak untuk didistribusikan secara publik tanpa izin.

---

## Kontributor

Dikembangkan oleh tim NeuralLift.
