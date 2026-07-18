# IbuSatset Code

Alat ringan untuk **menempel, menyimpan, dan membagikan potongan kode** (misalnya hasil scrape atau snippet plugin Baileys/Laravel) tanpa perlu server/database. Semua statis — bisa langsung di-deploy ke Vercel.

## Halaman

- **`index.html`** — daftar/jelajah semua snippet, cari, filter bahasa, bagikan lewat link, ekspor/impor `.json`. Bisa dibuka siapa saja.
- **`new.html`** — form tambah snippet baru, **dikunci password admin**. Dibuat halaman terpisah (bukan satu halaman dengan daftar) supaya form tidak menutupi/tertumpuk kartu snippet saat di-scroll di HP.

## Cara pakai

1. Buka `index.html` untuk melihat/mencari snippet.
2. Klik **+ Tambah Snippet** di pojok kanan atas → diarahkan ke `new.html`.
3. Masukkan password admin (default: `ibusatset`, lihat cara ganti di bawah).
4. Isi judul, bahasa, nama file, catatan, kode, dan sumber → **Simpan snippet**. Setelah masuk sebagai admin, kamu tetap "login" selama tab browser masih terbuka (session), jadi tidak perlu mengetik password lagi tiap tambah snippet.
5. Klik **Bagikan** pada kartu snippet untuk menyalin link yang berisi kode itu sendiri (di-encode di URL). Orang lain tinggal buka link-nya.
6. **Ekspor semua (.json)** untuk backup, **Impor .json** untuk memuat/menggabungkan koleksi.

## Ganti password admin

Password disimpan sebagai **hash SHA-256**, bukan teks polos, di `assets/js/store.js` (konstanta `ADMIN_PASSWORD_HASH`). Untuk ganti:

1. Buka console browser (F12), jalankan:
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('passwordBaruMu'))
     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
   ```
2. Salin hasil hash-nya, tempel ke `ADMIN_PASSWORD_HASH` di `assets/js/store.js`.

**Catatan penting:** ini situs statis tanpa backend, jadi ini bukan keamanan sungguhan — siapa pun yang cukup paham bisa membaca kode sumber di browser dan melihat hash-nya, lalu mencoba menebak/crack passwordnya secara offline. Ini cukup untuk mencegah orang iseng menambah snippet lewat UI, tapi jangan pakai password yang sama dengan akun pentingmu, dan jangan anggap ini proteksi terhadap penyerang yang serius.

## Struktur

- `index.html`, `new.html` — dua halaman utama
- `assets/css/style.css` — tema tampilan (kartu ala terminal)
- `assets/js/store.js` — penyimpanan bersama (localStorage) + util yang dipakai kedua halaman + cek password
- `assets/js/list.js` — logika `index.html`
- `assets/js/new.js` — logika `new.html` (gerbang password + form)
- `codes/example.json` — contoh snippet awal (dimuat otomatis saat koleksi masih kosong)
- `api/request.js` — placeholder serverless function (belum dipakai fitur inti)

## Catatan

Penyimpanan pakai `localStorage`, jadi data hanya ada di browser masing-masing orang. Untuk berbagi lintas perangkat, gunakan tombol **Bagikan** (link) atau **Ekspor/Impor** (file `.json`).
