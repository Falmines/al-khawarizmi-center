# AL-KHAWARIZMI CENTER

Website company profile Al-Khawarizmi Center dengan frontend HTML, CSS, dan
JavaScript serta backend Node.js dan Express.

## Persyaratan

- Node.js 22 LTS atau lebih baru
- npm
- PostgreSQL 14 atau lebih baru

## Instalasi dan pengembangan

Jalankan perintah dari direktori proyek:

```bash
npm install
```

Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dan ganti
`JWT_SECRET` dengan rahasia acak minimal 32 karakter. Nilai `.env.example`
hanya contoh dan bukan kredensial yang dapat digunakan.
Di PowerShell:

```powershell
Copy-Item .env.example .env
```

Buat database PostgreSQL bernama `al_khawarizmi_center` (atau sesuaikan nama di
`DATABASE_URL`), lalu jalankan migrasi:

```bash
npm run db:migrate
```

Jalankan server pengembangan dengan restart otomatis:

```bash
npm run dev
```

Buka <http://localhost:3000>. Untuk menjalankan server tanpa file watcher:

```bash
npm start
```

## Konfigurasi environment

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `NODE_ENV` | `development` | Mode runtime Express. |
| `PORT` | `3000` | Port server, harus berupa angka 1–65535. |
| `DATABASE_URL` | — | URL koneksi PostgreSQL. Jangan commit nilainya. |
| `JWT_SECRET` | — | Kunci JWT acak, minimal 32 karakter. Wajib untuk autentikasi. |
| `JWT_EXPIRES_IN` | `1h` | Masa berlaku access token JWT. |
| `CORS_ORIGIN` | kosong | Allowlist origin dipisahkan koma; same-origin tetap diizinkan. |
| `PGSSL` | `false` | Gunakan TLS PostgreSQL jika provider mewajibkannya. |

Jangan commit `.env`, kredensial, atau secret. Gunakan konfigurasi environment
rahasia yang disediakan oleh platform deployment.

## REST API

Semua endpoint API menggunakan prefix `/api/v1` dan mengembalikan JSON.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Status dan waktu server. |
| `GET` | `/api/v1/programs` | Daftar program. |
| `GET` | `/api/v1/programs/:programId` | Detail program (`livein`, `kerjabakti`, `kids`, `baksos`). |

`npm run db:migrate` menerapkan migrasi SQL versi satu kali dan mencatatnya pada
tabel `schema_migrations`. Migrasi membuat tabel pengguna, program, proyek riset,
kemitraan, pesan kontak, dan activity log; program situs awal ditambahkan sebagai
data seed.

Untuk menjalankan migrasi pertama kali, sambungkan `DATABASE_URL` ke database
PostgreSQL yang dapat diakses. Migrasi database tidak dapat dijalankan tanpa
server PostgreSQL dan kredensial yang valid.

## Pengujian

Jalankan pengujian endpoint, file statis, validasi, CORS, dan security headers:

```bash
npm test
```

## Deployment

1. Atur `NODE_ENV=production`, `PORT`, dan `CORS_ORIGIN` pada environment host.
2. Pasang dependency produksi dengan `npm ci --omit=dev`.
3. Jalankan aplikasi menggunakan `npm start`.
4. Arahkan domain atau reverse proxy ke port yang dikonfigurasi.

Express menyajikan halaman frontend dan aset statis dari direktori `public/`.

## Struktur

```text
public/                 HTML, CSS, JavaScript, dan gambar
src/controllers/        Handler endpoint API
src/data/               Data program
src/middleware/         Error handling dan 404
src/routes/             Route API
test/                   Pengujian API dan server statis
server.js               Entrypoint server
```

## Catatan konten

Roadmap 2026–2030 dan fasilitas kawasan merupakan adaptasi visi pengembangan,
bukan klaim kegiatan yang telah terlaksana. Realisasi fasilitas mengikuti
tahapan, kajian, dan kemitraan.
