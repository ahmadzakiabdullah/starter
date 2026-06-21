# Laravel + Inertia.js (React + TypeScript) Starter Kit

Sistem asas (*starter kit*) ini merupakan aplikasi portal pentadbiran premium yang dibina menggunakan gabungan Laravel 11/12, Inertia.js, React (TypeScript), Tailwind CSS v4, dan Shadcn UI. Sistem ini menyediakan asas modular yang kukuh untuk pembangunan aplikasi web perusahaan.

---

## 🚀 Status Semasa & Modul Sistem (System Modules)

Sistem ini telah lengkap dibangunkan, diuji kompilasinya, dan mempunyai modul-modul berikut:

### 1. 📂 Pengurus Media (Media Manager) - Versi Pelepasan `v2.0.0`
* **Pustaka Media Berpusat:** Ruang panel interaktif untuk memuat naik, mencari, dan menapis aset fail sistem.
* **Sokongan Folder Maya:** Mengkategorikan fail secara logik ke dalam folder maya tanpa mengubah struktur fizikal fail.
* **Drag-and-Drop Uploader:** Zon seretan fail yang lancar untuk muat naik fail pantas sehingga 10MB.
* **Pemadaman Pukal (Bulk Actions):** Keupayaan untuk memilih berbilang fail dan memadamkannya secara serentak.
* **Komponen MediaSelector Modal:** Komponen popover dialog yang boleh diguna semula untuk memilih aset logo/favicon dari pustaka media dalam mana-mana form input.

### 2. ⚙️ Pengurusan Tetapan Branding & Sistem
* **Live Branding Preview:** Panel simulasi masa-nyata (*sticky card preview*) untuk melihat perubahan Logo (Lucide Icon vs Fail Gambar), Favicon, dan Nama Aplikasi pada sidebar, tab pelayar, dan halaman log masuk secara langsung sebelum disimpan.
* **Pusat Kandungan Reka Letak:** Seluruh halaman tetapan branding diselaraskan ke kedudukan tengah (`mx-auto max-w-5xl`) untuk memaksimumkan visual pada monitor skrin lebar.
* **Butang Simpan di Header Atas:** Butang *Save Settings* dialih ke bahagian atas kanan header menggunakan rujukan atribut `form="settings-form"` untuk kemudahan simpanan yang pantas tanpa perlu skrol ke bawah.
* **Pembersihan Cache Sistem:** Utiliti butang pantas untuk mengosongkan cache aplikasi, cache laluan (*routes*), cache *views*, serta optimisasi fail sistem secara berpusat.
* **Konfigurasi SMTP & Ujian Hubungan:** Antara muka tetapan mel (driver SMTP/Log) dilengkapi dengan butang **Test SMTP Connection** untuk mengesahkan parameter emel secara langsung.

### 3. 👥 Pengurusan Pengguna & Peranan (Users & Roles CRUD)
* **Profil & Akses Klien:** Pendaftaran, kemaskini profil, penukaran avatar, dan pemadaman pengguna.
* **Kawalan Peranan (Roles & Permissions):** Sistem penetapan peranan (`Superadmin`, `Admin`, `Manager`, `User`) berasaskan kotak pilihan interaktif.
* **Export Profil:** Utiliti mengeksport data profil pengguna yang dipilih ke dalam format fail CSV.
* **Sokongan 2FA:** Penyepaduan Pengesahan Dua Faktor (*Two-Factor Authentication*) untuk kawalan keselamatan tinggi.

### 4. 📈 Papan Pemuka, Telemetri & Log Audit
* **Statistik Utama:** Kad status visual menunjukkan bilangan keseluruhan profil, pentadbir, status verifikasi emel, dan barisan tugasan.
* **Pemberitahuan Sistem:** Senarai notifikasi penting sistem berserta fungsi padam semua dan tandakan telah dibaca.
* **Widget Telemetri Sistem:** Paparan peratusan penggunaan CPU, RAM, dan Kapasiti Disk secara *real-time*.
* **Log Audit Aktiviti:** Jejak audit komprehensif merekodkan sebarang aktiviti sistem berserta data sebelum/selepas perubahan dan IP alamat pengguna.

### 5. 🛠️ Diagnostik & Sandaran (System Backups & Logs)
* **Log Reader Dashboard:** Panel membaca fail log Laravel secara langsung dari panel admin tanpa perlu membuka fail `.log` secara manual.
* **Backup Manager:** Utiliti menjana arkib sandaran fail dan pangkalan data sistem, memuat turun arkib `.zip`, dan memadam fail sandaran lama.
* **Health Monitor Dashboard:** Metrik kesihatan pangkalan data, sambungan pelayan, dan status cache.

### 6. 📜 Garis Masa Changelogs (Versi Sistem)
* **Accordion Changelogs UI:** Papan paparan log versi sistem yang kemas menggunakan elemen Accordion Radix UI. Nota pelepasan terkini dipaparkan secara automatik manakala versi lama boleh dikembangkan secara interaktif untuk menjimatkan ruang halaman.

---

## 🛠️ Pemasangan & Persediaan Pelayan (Installation)

Ikuti langkah-langkah berikut untuk menjalankan projek ini di persekitaran tempatan anda:

### 1. Klon Repositori & Pasang Dependensi
```bash
# Pasang dependensi PHP (Composer)
composer install

# Pasang dependensi Frontend (NPM)
npm install
```

### 2. Konfigurasi Fail Persekitaran (.env)
Salin fail `.env.example` kepada `.env` dan kemaskini konfigurasi pangkalan data MySQL anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Jana Kunci Aplikasi & Jalankan Migrasi
```bash
# Jana APP_KEY
php artisan key:generate

# Jalankan migrasi pangkalan data berserta seeders (Pengguna, Peranan & Changelogs)
php artisan migrate:fresh --seed
```

### 4. Jalankan Pelayan Tempatan
```bash
# Jalankan Laravel Dev Server (Terminal 1)
php artisan serve

# Jalankan Vite Hot Dev Server (Terminal 2)
npm run dev
```

Kini aplikasi anda boleh diakses melalui laman tempatan: `http://127.0.0.1:8000` atau `http://laravel.test/`.

---

## 🎨 Konvensyen Kod Fail (Coding Conventions)

Sila rujuk fail **[PROJECT_MAP.md](PROJECT_MAP.md)** untuk melihat struktur folder core, skema pangkalan data penuh, peraturan penamaan fail, dan alias import TypeScript `@/` bagi mengekalkan konsistensi kod.
