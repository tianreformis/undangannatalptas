# Undangan Perayaan Natal — Perkantas

Undangan digital mobile-first untuk Perayaan Natal Perkantas, dibangun dengan **Vue 3 (Composition API, `<script setup>`) + Vite + Vue Router (history mode) + Tailwind CSS**, backend **Vercel Serverless Functions (TypeScript)** dan database **Neon Postgres** (`@neondatabase/serverless`).

- Cover layar penuh dengan ornamen Natal, bintang berkelip, dan salju halus.
- Nama penerima personal lewat slug (`/budi-santoso`) atau query (`?to=Budi Santoso`).
- **Admin Panel** di `/admin` (CRUD pengaturan, rundown, tamu, ekspor CSV, statistik).
- **RSVP online** langsung di undangan (tanpa WhatsApp) dengan validasi server-side.
- Semua data acara dari database (bukan file config statis).

---

## 1. Menjalankan (Development)

Butuh **Node.js 20+** dan **Neon database** (lihat §5).

```bash
npm install
cp .env.example .env        # isi variabel di bawah
npm run migrate             # buat tabel di Neon
npm run dev                 # http://localhost:5173
npm run vercel:dev          # http://localhost:3000 (dengan serverless functions)
npm run build               # hasil produksi di dist/
npm run preview             # uji hasil build
```

---

## 2. Environment Variables (`.env`)

Salin `.env.example` lalu isi:

```bash
# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
# Pooling URL disarankan: postgresql://user:pass@ep-xxx.pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Admin Auth
ADMIN_PASSWORD=password_anda_yang_aman
SESSION_SECRET=string_acak_minimal_32_karakter_untuk_menandatangani_cookie

# Frontend (Vite)
VITE_SITE_URL=https://undangan-natal.vercel.app
```

- `DATABASE_URL`: Connection string Neon (pakai **pooled** untuk serverless).
- `SESSION_SECRET`: Generate via `openssl rand -base64 32` atau `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `VITE_SITE_URL`: URL produksi, dipakai untuk `og:image`, link WhatsApp, dan CSRF origin check.

---

## 3. Struktur Proyek

```
src/
  components/
    admin/
      AdminLayout.vue        # Sidebar + top bar + user menu
      StatCard.vue           # Kartu statistik di Summary
      icons/*.vue            # Ikon navigasi
    Cover.vue                # Cover layar penuh + ornaments
    Hero.vue                 # Judul, tema, salam pembuka
    Verse.vue                # Ayat firman (muncul jika diisi)
    EventDetails.vue         # Tanggal, waktu, lokasi, maps, kalender
    Countdown.vue            # Hitung mundur (muncul jika tanggal diisi)
    Rundown.vue              # Timeline acara (muncul jika diisi)
    RsvpForm.vue             # Form RSVP online (hadir/tidak hadir + stepper + pesan)
    Closing.vue              # Penutup + footer Perkantas
    SnowEffect.vue           # Salju canvas (hemat performa, hormati reduced motion)
    MusicPlayer.vue          # Tombol musik mengambang
  composables/useGuestName.js# Resolve nama dari slug/query (read-only)
  utils/
    slug.js                  # slugify, normalize, generateUniqueSlug
    share.js                 # link undangan, wa.me, template pesan, copy
    date.js                  # format tanggal + pembuatan file .ics
  views/
    Invitation.vue           # Halaman undangan utama (/ dan /:slug)
    admin/
      Login.vue              # /admin/login
      Dashboard.vue          # Layout admin + router-view children
      Summary.vue            # Ringkasan statistik
      Settings.vue           # Pengaturan acara (GET/PUT /api/admin/settings)
      Rundown.vue            # Kelola rundown (CRUD + drag-order)
      Guests.vue             # Kelola tamu (CRUD, bulk, copy link, WA, ekspor CSV)
      Rsvps.vue              # Daftar RSVP terbaru
  router/index.js            # Routes: /admin/* DULUAN sebelum /:slug
public/
  images/                    # Ornamen cover (PNG + WebP hasil optimasi)
  audio/natal-instrumental.mp3
  og-image.png               # Gambar pratinjau WhatsApp (1200×630)
  _redirects                 # Fallback SPA Netlify
api/                         # Vercel Serverless Functions (TypeScript)
  _db.ts                     # Neon client (sql tagged template)
  _auth.ts                   # HMAC-SHA256 cookie auth + rate limit login
  _rateLimit.ts              # RSVP rate limit + sanitasi
  _slug.ts                   # Slug utilitas shared
  _adminAuth.ts              # Middleware requireAdmin
  event.ts                   # GET /api/event (public)
  guest.ts                   # GET /api/guest?slug= (public)
  rsvp.ts                    # POST /api/rsvp (public)
  admin/
    login.ts                 # POST /api/admin/login
    logout.ts                # POST /api/admin/logout
    settings.ts              # GET/PUT /api/admin/settings
    rundown.ts               # GET/POST/PUT/DELETE /api/admin/rundown
    guests.ts                # GET/POST/PUT/DELETE /api/admin/guests + /export
    rsvps.ts                 # GET /api/admin/rsvps
db/schema.sql                # Schema idempoten (CREATE TABLE IF NOT EXISTS)
scripts/
  migrate.ts                 # Jalankan schema.sql ke Neon
  prepare-ornaments.py       # Optimasi PNG/WebP ornamen
  optimize-og.py             # Kompres og-image.png
  og-image.html              # Sumber OG image (butuh Playwright)
assets-src/ornaments/        # Berkas ornamen asli (tidak ikut deploy)
deploy/nginx.conf.example    # Contoh try_files nginx
vercel.json                  # Rewrite SPA + CORS headers API
.env.example                 # Contoh variabel environment
```

---

## 4. Database Schema (Neon Postgres)

Jalankan `npm run migrate` setelah isi `DATABASE_URL`. Script idempoten (`CREATE TABLE IF NOT EXISTS`).

### Tabel `settings` (key-value)

| Key | Default | Deskripsi |
|-----|---------|-----------|
| `title` | `'Perayaan Natal'` | Judul acara |
| `theme` | `''` | Tema Natal |
| `greeting` | `'Dengan sukacita...'` | Salam pembuka |
| `verse_text` | `''` | Teks ayat |
| `verse_reference` | `''` | Referensi ayat |
| `event_date` | `''` | Tanggal `YYYY-MM-DD` |
| `event_time` | `''` | Waktu `HH:mm` |
| `time_zone_label` | `'WIB'` | Zona waktu |
| `venue_name` | `''` | Nama tempat |
| `address` | `''` | Alamat lengkap |
| `maps_url` | `''` | Link Google Maps (HTTPS) |
| `dress_code` | `''` | Dress code |
| `contact_name` | `''` | Nama kontak |
| `contact_whatsapp` | `''` | WhatsApp (format `62xxxxxxxxx`) |
| `rsvp_open` | `'0'` | `'1'` = buka RSVP |

### Tabel `rundown`

- `id SERIAL PK`
- `time TEXT` (mis. `18.00`)
- `title TEXT` (mis. `Registrasi`)
- `sort_order INT DEFAULT 0`

### Tabel `guests`

- `id SERIAL PK`
- `slug TEXT UNIQUE NOT NULL` (auto-generate dari nama)
- `name TEXT NOT NULL`
- `group_name TEXT` (opsional)
- `max_guests INT DEFAULT 1` (max 20)
- `created_at TIMESTAMPTZ DEFAULT now()`

### Tabel `rsvps`

- `id SERIAL PK`
- `guest_id INT UNIQUE REFERENCES guests(id) ON DELETE CASCADE`
- `status TEXT CHECK (status IN ('hadir','tidak_hadir'))`
- `attendees INT DEFAULT 1` (0 jika tidak_hadir)
- `message TEXT`
- `responded_at TIMESTAMPTZ DEFAULT now()`

---

## 5. Setup Neon Database

1. Buka [console.neon.tech](https://console.neon.tech) → **Create Project**.
2. Pilih region terdekat (mis. `us-east-1` atau `ap-southeast-1`).
3. Copy **Pooled connection string** (berakhiran `.pooler.xxx`).
4. Set di `.env` → `DATABASE_URL=...`.
5. Jalankan migrasi:
   ```bash
   npm run migrate
   ```
   Output:
   ```
   🔄  Menjalankan migrasi database...
      ✓  CREATE TABLE IF NOT EXISTS settings...
      ✓  INSERT INTO settings...
      ✓  CREATE TABLE IF NOT EXISTS rundown...
      ✓  CREATE TABLE IF NOT EXISTS guests...
      ✓  CREATE TABLE IF NOT EXISTS rsvps...
      ✓  CREATE INDEX IF NOT EXISTS...
   ✅  Migrasi selesai.
   ```

---

## 6. Admin Panel

### Akses
- Buka `/admin/login` → masukkan `ADMIN_PASSWORD`.
- Cookie session: **HttpOnly, Secure, SameSite=Strict, 12 jam**.
- Rate limit login: **5 gagal / 15 menit per IP** (delay kecil pada jawaban salah).

### Navigasi (Tab di `/admin`)

| Tab | Fitur |
|-----|-------|
| **Ringkasan** | Kartu: total diundang, hadir, tidak hadir, belum jawab, total orang hadir. Klik kartu → filter ke halaman Tamu. |
| **Pengaturan Acara** | Form semua field `settings`. Validasi: tanggal `YYYY-MM-DD`, jam `HH:mm`, Maps HTTPS, WA `62xxxxxxxxx`. Tombol **Simpan** + notifikasi. Tombol **Lihat Undangan** → buka tab baru (`VITE_SITE_URL`). |
| **Susunan Acara** | Tambah/Edit/Hapus item. Urutkan via tombol ▲▼ (tukar `sort_order`). |
| **Tamu** | Tabel: nama, kelompok, maks tamu, status RSVP. **Pencarian** + **Filter** (semua/hadir/tidak/belum). **Tambah Satu** (form) / **Tambah Banyak** (textarea, format `Nama | Kelompok | Maks`). **Edit** / **Hapus** (konfirmasi). **Salin Link** / **Kirim WhatsApp** per tamu (template siap pakai). **Salin Semua Link**. **Ekspor CSV** (nama, kelompok, link, status, jumlah hadir, pesan, waktu). |
| **Daftar RSVP** | Daftar jawaban terbaru: nama, kelompok, status, jumlah hadir, pesan, waktu respons. |

> **Catatan:** Halaman `/generator` publik **dihapus**. Fungsinya digantikan tab **Tamu**.

---

## 7. Halaman Undangan (`/:slug`)

### Data Acara
Diambil dari `GET /api/event` (cache `s-maxage=30, stale-while-revalidate=60`).
- Skeleton saat loading.
- Field kosong → **"Segera diinformasikan"**.
- Countdown, tombol Maps, tombol Kalender, Ayat, Rundown → **disembunyikan** bila data kosong.

### Nama Penerima
- Slug terdaftar → nama dari database.
- Slug tidak terdaftar → fallback ke slug→Title Case atau **"Bapak/Ibu/Saudara/i"**.
- Fitur "Ubah nama" **hanya mengubah tampilan di layar** (tidak menyimpan ke DB).

### RSVP Online (Baru)
Menggantikan RSVP via WhatsApp. Muncul **hanya** jika:
- Slug terdaftar di database.
- `rsvp_open = '1'` di settings.

**Tampilan:**
- **Belum jawab:** Dua kartu besar — "Ya, saya akan hadir" / "Mohon maaf, tidak dapat hadir".
- **Pilih Hadir:** Stepper jumlah orang (1..`max_guests`), kolom ucapan opsional (max 300 char).
- **Tombol Kirim** → loading → tampilan terima kasih beda untuk hadir/tidak hadir.
- **Sudah jawab:** Tampil jawaban sebelumnya + tombol **"Ubah jawaban"**.
- **Error jaringan:** Pesan ramah + tombol coba lagi.

**Validasi Server:**
- Slug harus terdaftar.
- Status hanya `'hadir'` / `'tidak_hadir'`.
- Attendees integer 1..`max_guests` (force 0 jika tidak_hadir).
- Pesan max 300 char, trim, hapus control char.
- `rsvp_open` harus `'1'`.
- **UPSERT** (`ON CONFLICT guest_id DO UPDATE`) → tamu bisa ubah jawaban.
- **Rate limit:** 20 req/menit per IP (in-memory best-effort).

---

## 8. API Endpoints

### Publik
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/event` | Semua settings + rundown terurut |
| GET | `/api/guest?slug=...` | `{ name, maxGuests, rsvp? }` — 404 jika slug tidak ada |
| POST | `/api/rsvp` | `{ slug, status, attendees, message }` — validasi + upsert |

### Admin (butuh session cookie)
| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/admin/login` | `{ password }` → set cookie HMAC-SHA256 |
| POST | `/api/admin/logout` | Hapus cookie |
| GET/PUT | `/api/admin/settings` | Baca/simpan semua settings |
| GET/POST/PUT/DELETE | `/api/admin/rundown` | CRUD rundown |
| GET/POST/PUT/DELETE | `/api/admin/guests` | CRUD tamu + bulk + export CSV |
| GET | `/api/admin/rsvps` | Daftar RSVP terbaru |

---

## 9. Keamanan & Kualitas

- **Parameterized queries** di semua API (tagged template `sql\`...\``) — **tidak ada string concatenation**.
- **Escape** semua teks dari DB saat render (tidak pakai `v-html` untuk data user).
- **Env sensitif** (`DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`) **tidak pernah** dikirim ke frontend (hanya `VITE_*`).
- Error API konsisten: `{ error: "..." }` dengan status code yang tepat.
- `vercel.json` rewrite SPA → `/:slug` dan `/admin` tidak 404 saat refresh.
- Daftar tamu privat: endpoint publik hanya mengembalikan data slug yang diminta.
- CSRF protection: verifikasi `Origin`/`Host` pada request mutasi.
- Rate limit login & RSVP (in-memory, reset cold start).

---

## 10. Deploy ke Vercel

### 1. Push ke GitHub/GitLab
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import Project di Vercel
- Framework Preset: **Vite**.
- Root Directory: `./` (jika mono-repo, atur sesuai).
- Build Command: `npm run build` (default).
- Output Directory: `dist` (default).

### 3. Environment Variables di Vercel Dashboard
Settings → Environment Variables → tambahkan:
| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` (pooled) | Production, Preview, Development |
| `ADMIN_PASSWORD` | `password_anda` | Production, Preview, Development |
| `SESSION_SECRET` | `base64_32_chars` | Production, Preview, Development |
| `VITE_SITE_URL` | `https://undangannatalptas.vercel.app` | Production, Preview, Development |

> **Penting:** `VITE_SITE_URL` **harus** diisi agar `og:image` dan link WhatsApp pakai URL absolut yang benar.

### 4. Deploy
- Klik **Deploy**. Build akan jalan, API di-deploy sebagai Serverless Functions.
- Setelah selesai, buka `https://undangannatalptas.vercel.app/admin/login` → login.
- Isi **Pengaturan Acara** → **Susunan Acara** → **Tamu** (tambah banyak via textarea).
- Buka link tamu → test RSVP → lihat di **Daftar RSVP** / **Ringkasan**.

### 5. Custom Domain (opsional)
Vercel Dashboard → Project → Settings → Domains → Add `undangan.perkantas.org` (atau domain Anda). Update `VITE_SITE_URL` di env → redeploy.

---

## 11. Menjalankan Lokal dengan `vercel dev`

```bash
npm install -g vercel  # atau npx vercel
vercel dev             # http://localhost:3000
```
- Menjalankan Vite dev server + Vercel Functions emulator.
- API tersedia di `http://localhost:3000/api/...`.
- Perlu `.env` lokal dengan `DATABASE_URL` Neon (dev branch atau main).

---

## 12. Ornamen Cover (PNG + WebP)

Simpan asli di `assets-src/ornaments/` (nama: `garland-top.png`, `garland-bottom.png`, `star.png`, `frame.png`, `og-image.png`).

```bash
python scripts/prepare-ornaments.py
```
→ Output ke `public/images/` (PNG + WebP, max-width: 760/1600/300/900).

Kompres OG image:
```bash
python scripts/optimize-og.py
```
→ `public/og-image.png` (1200×630, ~270 KB).

---

## 13. Checklist Sebelum Dibagikan

- [ ] Buat project Neon → copy pooled `DATABASE_URL`.
- [ ] Isi `.env` lokal → `npm run migrate`.
- [ ] `npm run vercel:dev` → login admin → isi pengaturan → tambah tamu → test RSVP.
- [ ] Push ke Git → import Vercel → isi 4 env vars di Dashboard.
- [ ] Deploy → cek `/admin/login` produksi → isi data lengkap.
- [ ] Test link tamu di HP: cover, hero, detail, RSVP, musik, salju.
- [ ] Cek OG image di WhatsApp (paste link → preview).
- [ ] Nonaktifkan **Deployment Protection** di Vercel Dashboard (Settings → Deployment Protection) agar publik.

---

## 14. Lisensi

MIT — Gunakan bebas untuk keperluan gereja/organisasi. Musik instrumental bebas royalti. Ornamen dari user (simpan asli di `assets-src/ornaments/`).