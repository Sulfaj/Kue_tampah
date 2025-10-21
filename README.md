# Kue Tampah Frontend

Antarmuka pemesanan kue tampah modern berbasis Next.js 14 dengan animasi halus, keranjang realtime, dan checkout via WhatsApp/QRIS. Seluruh komponen UI sudah diberi komentar panduan agar mudah dikustomisasi saat branding, gambar, atau copywriting berubah di masa depan.

## Fitur Utama
- Hero interaktif, highlight produk, cerita brand, dan galeri yang dibangun dari data lokal (lihat `frontend/app/page.tsx`).
- Keranjang global dengan Zustand + localStorage, tombol mengambang, serta pengingat notifikasi untuk cart yang ditinggalkan.
- Checkout WhatsApp lengkap dengan format pesan otomatis serta opsi menampilkan QRIS dari endpoint apa pun.
- Dukungan PWA ringan melalui service worker: precache halaman utama, fallback offline, dan penanganan klik notifikasi.
- Komentar penjelas pada setiap blok UI, utilitas, dan konfigurasi inti untuk memandu penyesuaian tampilan dan perilaku.

## Teknologi
- Next.js 14 App Router + TypeScript
- Tailwind CSS 4 (pre-release) dengan variabel desain kustom
- Zustand untuk state keranjang
- Framer Motion, Radix UI Dialog, react-hot-toast
- pnpm workspace (satu package `frontend`)

## Prasyarat
- Node.js 20.x (disarankan menggunakan `corepack`)
- pnpm (`corepack enable`)

## Menjalankan Proyek
```bash
# Instal dependensi dari root monorepo
pnpm install

# Mode pengembangan
pnpm dev

# Build produksi
pnpm build

# Preview produksi
pnpm start
```
Secara default aplikasi akan tersedia di `http://localhost:3000`.

## Script yang Tersedia
| Command | Lokasi | Deskripsi |
| --- | --- | --- |
| `pnpm dev` | root | Menjalankan `next dev` untuk workspace `frontend`. |
| `pnpm build` | root | Build Next.js untuk deployment. |
| `pnpm start` | root | Menjalankan server produksi hasil build. |
| `pnpm --filter frontend dev` | root/front | Menjalankan script langsung pada package `frontend`. |

Saat ini belum tersedia script test/lint di package `frontend`. Tambahkan sesuai kebutuhan sebelum implementasi pipeline CI/CD.

## Variabel Lingkungan
| Nama | Contoh | Wajib | Keterangan |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `6281234567890` | Opsional | Nomor yang dipakai pada checkout WhatsApp. Ada fallback di kode. |
| `NEXT_PUBLIC_QRIS_API_URL` | `https://api.qrserver.com/v1/create-qr-code/` | Opsional | Endpoint pembuat QR. Jika kosong, pakai default. |

Simpan variabel publik di `frontend/.env.local`. Restart dev server setelah mengubah file env.

## Struktur Proyek
```
.
├── package.json           # Workspace root + script proxy
└── frontend/
    ├── app/               # Halaman App Router (landing, cart, checkout) + layout & global styles
    ├── components/        # UI modular seperti Navbar, ProductCard, CheckoutForm, dsb
    ├── context/           # Store Zustand untuk keranjang + pengingat notifikasi
    ├── lib/               # Helper (produk dummy, formatter rupiah, builder WhatsApp/QRIS)
    ├── public/            # Asset statis, service worker, gambar
    ├── utils/             # Utility tambahan (scheduler notifikasi)
    └── package.json
```
Setiap file kunci berisi komentar singkat yang menjelaskan tujuan blok kode dan titik kustomisasi (misalnya `frontend/app/page.tsx`, `frontend/components/CheckoutForm.tsx`, `frontend/context/CartContext.tsx`, `frontend/utils/notify.ts`).

## Kustomisasi Cepat
| Area | File | Keterangan |
| --- | --- | --- |
| Branding, hero, highlight produk | `frontend/app/page.tsx` | Komentar `//` sebelum setiap section memandu perubahan gambar, teks, dan CTA. |
| Layout global & font | `frontend/app/layout.tsx` | Atur font Google, metadata, serta posisi Navbar/Footer. |
| Skema warna & radius | `frontend/app/globals.css` | Variabel CSS `--brand-*` siap disesuaikan. |
| Navigasi & footer | `frontend/components/Navbar.tsx`, `frontend/components/Footer.tsx` | Daftar link dan kontak bisa diubah cepat. |
| Data produk | `frontend/lib/products.ts` | Update array `products` untuk mengganti katalog. |
| Checkout | `frontend/components/CheckoutForm.tsx`, `frontend/lib/whatsapp.ts`, `frontend/lib/qris.ts` | Ubah field, template pesan, atau endpoint QRIS. |
| Pengingat keranjang | `frontend/context/CartContext.tsx`, `frontend/utils/notify.ts`, `frontend/public/sw.js` | Atur interval, teks notifikasi, serta behaviour service worker. |

## PWA dan Pengingat Keranjang
- Service worker `frontend/public/sw.js` melakukan precache halaman, fallback offline, serta membuka halaman cart saat notifikasi diklik.
- `initializeReminderWatcher` di `frontend/context/CartContext.tsx` menjadwalkan pengingat setelah 15 menit keranjang tidak disentuh (bisa diubah lewat konstanta di `frontend/utils/notify.ts`).
- Pastikan pengguna memberi izin notifikasi agar fitur ini aktif.

## Deployment
1. Jalankan `pnpm install` dan `pnpm build`.
2. Deploy direktori `.next` hasil build di platform pilihan (Vercel, Netlify, dsb).
3. Pastikan environment variable publik tersedia di platform hosting.
4. Jika memakai service worker, izinkan file `sw.js` dan `manifest.json` disajikan dari root domain.

---
Untuk penyesuaian lebih lanjut, ikuti komentar di dalam file kode. Semua tanda komentar terbaru menggunakan bahasa Indonesia supaya mudah dipahami tim internal. Selamat mengembangkan!
