# AL-KHAWARIZMI CENTER

Website company profile Al-Khawarizmi Center. Frontend HTML, CSS, dan
JavaScript disajikan oleh backend Node.js dan Express.

## Persyaratan

- Node.js 22 atau lebih baru
- npm
- PostgreSQL 14 atau lebih baru untuk menjalankan migrasi database

## Instalasi dan pengembangan lokal

Jalankan dari direktori proyek:

```bash
npm install
```

Buat file `.env` dari template:

```powershell
Copy-Item .env.example .env
```

Isi `DATABASE_URL` dengan URL database PostgreSQL yang benar. Untuk Supabase,
salin connection string dari **Project Settings → Database → Connection
string**. Ganti placeholder password; URL dengan password yang mengandung
karakter khusus harus di-URL-encode. Jangan membagikan atau commit `.env`.

Jalankan migrasi hanya setelah koneksi PostgreSQL berhasil dikonfigurasi:

```bash
npm run db:migrate
```

Kemudian jalankan server:

```bash
npm run dev
```

Buka <http://localhost:3000>. Untuk menjalankan tanpa file watcher:

```bash
npm start
```

Tanpa `DATABASE_URL` atau kombinasi variabel `PGHOST`, `PGPORT`, `PGDATABASE`,
`PGUSER`, dan `PGPASSWORD`, server web masih dapat berjalan, tetapi endpoint
health database melaporkan database tidak tersedia dan migrasi tidak dapat
dijalankan.

## Environment variables

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `NODE_ENV` | `development` | Mode runtime. |
| `PORT` | `3000` | Port HTTP, harus antara 1–65535. |
| `DATABASE_URL` | — | URL PostgreSQL; prioritas utama untuk koneksi database. |
| `PGHOST` | `localhost` | Host PostgreSQL, digunakan jika `DATABASE_URL` tidak diisi. |
| `PGPORT` | `5432` | Port PostgreSQL. |
| `PGDATABASE` | `al_khawarizmi_center` | Nama database. |
| `PGUSER` | `postgres` | Pengguna database. |
| `PGPASSWORD` | — | Password database; diperlukan untuk membentuk URL dari variabel `PG*`. |
| `PGSSL` | `false` | `false` tanpa TLS, `true`/`verify-full` dengan verifikasi sertifikat, atau `require` untuk TLS tanpa verifikasi CA (gunakan hanya bila provider mengharuskan). |
| `JWT_SECRET` | Secret development bawaan | Belum digunakan oleh endpoint autentikasi; jangan mengandalkan nilai bawaan di production. |
| `JWT_EXPIRES_IN` | `1h` | Konfigurasi yang disiapkan untuk JWT; belum digunakan endpoint saat ini. |
| `CORS_ORIGIN` | kosong | Allowlist origin, dipisahkan koma. |

Gunakan secret unik dan kuat pada environment deployment. Jika kredensial pernah
dibagikan, segera rotasi password database, token, dan secret yang terdampak.

## API yang tersedia

Endpoint API mengembalikan JSON.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Status aplikasi dan waktu server. |
| `GET` | `/api/health` | Memeriksa koneksi database; mengembalikan `503` bila belum dikonfigurasi. |
| `GET` | `/api/v1/programs` | Daftar program berstatus `published`. |
| `GET` | `/api/v1/programs/:programId` | Detail program berdasarkan slug, misalnya `livein`. |

## Status database

`npm run db:migrate` menjalankan file SQL bernomor di
`database/migrations/` dan mencatat migrasi yang berhasil pada tabel
`schema_migrations`. Migrasi membuat tabel pengguna, program, proyek riset,
kemitraan, pesan kontak, dan activity log. Seed program awal dilakukan oleh
migrasi.

Jika PostgreSQL dikonfigurasi, endpoint program membaca tabel `programs` dan
hanya mengembalikan baris berstatus `published`. Tanpa konfigurasi database,
endpoint tersebut menggunakan data bawaan `src/data/programs.js` agar website
tetap berfungsi lokal. Kegagalan query saat database dikonfigurasi akan
dilaporkan sebagai error, bukan disamarkan dengan fallback.

Untuk Supabase, gunakan connection string dari **Project Settings → Database**.
Jika memakai transaction pooler, gunakan hostname dan port yang diberikan
Supabase (umumnya port `6543`) serta username `postgres.<project-ref>`.
`PGSSL=require` tetap mengenkripsi koneksi, tetapi tidak memverifikasi sertifikat
CA; pilih `verify-full` jika memiliki CA certificate yang dapat dipercaya.

Autentikasi JWT dan operasi CRUD database untuk pengguna, proyek riset,
kemitraan, pesan kontak, dan activity log belum diimplementasikan. Migrasi
membuat struktur tabel untuk modul-modul itu, tetapi belum menghubungkan
endpoint/API untuk mengelolanya.

Jangan jalankan migrasi ke database produksi sebelum memeriksa connection
string dan membuat backup sesuai prosedur operasional Anda. Migrasi menambahkan
objek database dan tidak ditujukan untuk menghapus tabel atau data yang ada.

## Pengujian

```bash
npm test
```

Pengujian mencakup routes API, penyajian frontend, validasi, CORS, dan security
headers.

## Deployment

### Node.js host

1. Atur `NODE_ENV=production`, `PORT`, `DATABASE_URL`, `PGSSL` (bila diperlukan),
   dan `CORS_ORIGIN` pada environment host.
2. Atur secret secara aman di dashboard host; jangan unggah `.env`.
3. Jalankan migrasi dari environment yang dapat menjangkau database:
   `npm run db:migrate`.
4. Install dependency produksi dengan `npm ci --omit=dev`.
5. Jalankan `npm start`.

### Vercel

Repository menyediakan `vercel.json` dan entry point serverless di
`api/index.js`. Tambahkan environment variables yang diperlukan melalui
pengaturan proyek Vercel. Jalankan migrasi terhadap database target sebelum
mengandalkan fitur database. Setelah deploy, verifikasi halaman utama dan
endpoint `/api/v1/health`.

Express menyajikan frontend dan aset statis dari `public/`.

## Struktur proyek

```text
api/                    Entry point serverless Vercel
database/migrations/    Migrasi PostgreSQL
public/                 HTML, CSS, JavaScript, dan gambar
scripts/                Skrip migrasi
src/config/             Environment dan koneksi database
src/controllers/        Handler API
src/data/               Data program statis
src/middleware/         Error handling dan 404
src/routes/             Routes API
test/                   Pengujian API dan server statis
server.js               Entrypoint server Node.js lokal
```

## Catatan konten

Roadmap 2026–2030 dan fasilitas kawasan merupakan adaptasi visi pengembangan,
bukan klaim kegiatan yang telah terlaksana. Realisasi fasilitas mengikuti
tahapan, kajian, dan kemitraan.
