# IbuSatset Code

Alat ringan untuk **menempel, menyimpan, dan membagikan potongan kode** (misalnya hasil scrape atau snippet plugin Baileys/Laravel) tanpa perlu server/database. Semua statis — bisa langsung di-deploy ke Vercel.

## Cara pakai

1. Buka `index.html` (langsung di browser, atau lewat deployment Vercel).
2. Isi form **Tempel kode baru** di kiri: judul, bahasa, nama file, catatan, kode, dan nama/sumber.
3. Klik **Simpan snippet** — tersimpan otomatis di `localStorage` browser kamu.
4. Klik **Bagikan** pada kartu snippet untuk menyalin link yang berisi kode itu sendiri (di-encode di URL, jadi orang lain tinggal buka link-nya tanpa perlu akses ke penyimpananmu).
5. Kalau membuka link bagikan orang lain, akan muncul banner "Simpan ke koleksiku" untuk menambahkannya ke koleksi lokalmu.
6. Gunakan **Ekspor semua (.json)** untuk backup seluruh koleksi, dan **Impor .json** untuk memuat kembali atau menggabungkan koleksi dari file `.json` (format sama seperti `codes/example.json`).

## Struktur

- `index.html` — markup halaman
- `assets/css/style.css` — tema tampilan (kartu ala terminal)
- `assets/js/app.js` — semua logika: simpan, cari, filter, bagikan, ekspor/impor
- `codes/example.json` — contoh snippet awal (dimuat otomatis saat koleksi masih kosong)
- `api/request.js` — placeholder serverless function (belum dipakai fitur inti; opsional kalau nanti mau tambah kirim-email/webhook)

## Catatan

Penyimpanan pakai `localStorage`, jadi data hanya ada di browser masing-masing orang. Untuk berbagi lintas perangkat, gunakan tombol **Bagikan** (link) atau **Ekspor/Impor** (file `.json`).
