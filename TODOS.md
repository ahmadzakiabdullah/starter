# TODOS — System Audit Action Plan

> Generated from **Complete System Audit & Architecture Review** (2026-06-23)  
> Current System Score: **48/100** → Target: **80+/100**

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Belum mula |
| `[/]` | Sedang dilaksanakan |
| `[x]` | Selesai |
| 🔴 | Critical — mesti buat segera |
| 🟠 | High — penting, perlu buat dalam masa terdekat |
| 🟡 | Medium — disarankan, boleh jadual |
| 🟢 | Low — penambahbaikan, bila ada masa |

---

## Phase 1 — Pembaikan Segera (0–2 Minggu)

> **Objektif**: Betulkan semua bug kritikal, tampalan keselamatan, dan vulnerability yang boleh menyebabkan crash atau serangan.
>
> **Status: ✅ SELESAI (2026-06-23)**

### 1.1 🔴 Bug Kritikal

- [x] **Fix `RoleController::destroy()` — undefined `$request` variable** ✅ SELESAI
  - **Fail**: `app/Http/Controllers/RoleController.php` (line 122)
  - **Masalah**: Method `destroy(Role $role)` tidak ada parameter `$request`, tetapi baris 122 memanggil `$request->user()`. Ini akan crash dengan `Undefined variable: $request` apabila mana-mana role dipadam.
  - **Cara Fix**: Tambah `Request $request` sebagai parameter, ATAU guna helper `request()->user()`.
  - **Anggaran Masa**: 5 minit

  ```php
  // SEBELUM (BUG):
  public function destroy(Role $role)
  {
      AuditLog::record($request->user(), ...); // ← $request undefined!
  }

  // SELEPAS (FIX):
  public function destroy(Request $request, Role $role)
  {
      AuditLog::record($request->user(), ...);
  }
  ```

- [x] **Fix `AnnouncementController` — `AuditLog::record()` menerima `int` bukan `Model`** ✅ SELESAI
  - **Fail**: `app/Http/Controllers/AnnouncementController.php` (line 42, 71, 95)
  - **Masalah**: Parameter ke-3 `AuditLog::record()` sepatutnya `?Model $subject`, tetapi controller hantar `$announcement->id` (integer). Ini menyebabkan `auditable_type` dan `auditable_id` menyimpan data salah.
  - **Cara Fix**: Tukar `$announcement->id` kepada `$announcement`.
  - **Anggaran Masa**: 10 minit

  ```php
  // SEBELUM (BUG):
  AuditLog::record($request->user(), 'announcement.created', $announcement->id, ...);

  // SELEPAS (FIX):
  AuditLog::record($request->user(), 'announcement.created', $announcement, ...);
  ```

---

### 1.2 🔴 Keselamatan Kritikal (Security)

- [x] **Buang `shell_exec()` daripada web controller** ✅ SELESAI
  - **Fail**: `app/Http/Controllers/DashboardController.php` (line 80-102), `app/Http/Controllers/HealthMonitorController.php` (line 39-82)
  - **Masalah**: `shell_exec()` dalam HTTP request berisiko Remote Code Execution. Juga block shared hosting.
  - **Cara Fix**:
    1. Cipta `app/Services/TelemetryService.php` — pindahkan semua logik CPU/RAM/Disk ke sini
    2. Cache hasilnya selama 30-60 saat menggunakan `Cache::remember()`
    3. Kedua-dua controller panggil service yang sama (hapuskan duplikasi)
  - **Anggaran Masa**: 3-4 jam

- [x] **Ganti `addslashes()` dengan `PDO::quote()` dalam BackupController** ✅ SELESAI
  - **Fail**: `app/Http/Controllers/BackupController.php` (line 89)
  - **Masalah**: `addslashes()` TIDAK selamat untuk MySQL escaping (serangan multi-byte character). Backup dump SQL boleh mengandungi injection.
  - **Cara Fix**: Guna `DB::connection()->getPdo()->quote($val)` untuk escape nilai, ATAU guna package backup seperti `spatie/laravel-backup`.
  - **Anggaran Masa**: 1 jam

  ```php
  // SEBELUM (TIDAK SELAMAT):
  return "'" . addslashes($val) . "'";

  // SELEPAS (SELAMAT):
  return DB::connection()->getPdo()->quote($val);
  ```

- [x] **Tambah whitelist jenis fail untuk media upload** ✅ SELESAI
  - **Fail**: `app/Http/Controllers/MediaController.php` (line 63-66)
  - **Masalah**: Hanya ada had saiz `max:10240` sahaja. Tiada semakan MIME type — pengguna boleh upload `.php`, `.exe`, `.sh`.
  - **Cara Fix**: Tambah validation rule `mimes` atau `mimetypes`.
  - **Anggaran Masa**: 15 minit

  ```php
  // SEBELUM:
  'file' => 'required|file|max:10240',

  // SELEPAS:
  'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,csv,txt,zip',
  ```

- [x] **Encrypt SMTP credentials dalam settings table** ✅ SELESAI
  - **Fail**: `app/Models/Setting.php`, `app/Http/Controllers/SystemSettingsController.php`
  - **Masalah**: `mail_password` disimpan dalam plaintext di database. Sesiapa yang ada akses DB boleh baca password SMTP.
  - **Cara Fix**: Guna `Crypt::encryptString()` semasa simpan dan `Crypt::decryptString()` semasa baca untuk field `mail_password` dan `mail_username`.
  - **Anggaran Masa**: 2-3 jam

- [x] **Buang `@exec('git log ...')` dari Changelog model** ✅ SELESAI
  - **Fail**: `app/Models/Changelog.php` (line 52)
  - **Masalah**: `exec()` dalam model layer — tidak sepatutnya ada system calls dalam Eloquent model.
  - **Cara Fix**: Pindahkan `syncFromGit()` ke Artisan Command (`php artisan changelog:sync`) atau Service class. Jangan panggil dari web request.
  - **Anggaran Masa**: 1-2 jam

---

### 1.3 🟠 Authorization (Akses Kawalan)

- [x] **Tambah authorization gate pada media routes** ✅ SELESAI
  - **Fail**: `app/Http/Controllers/MediaController.php`
  - **Masalah**: TIADA semakan role/permission. Mana-mana pengguna yang login boleh upload, rename, padam SEMUA media termasuk logo/favicon sistem.
  - **Cara Fix**: Tambah `Gate::authorize('manage-media')` atau `abort_unless()` semakan role pada setiap method. Cipta permission `manage-media` dalam seeder.
  - **Anggaran Masa**: 1 jam

- [x] **Tambah authorization gate pada changelog routes** ✅ SUDAH ADA (store/update/destroy sudah ada `abort_unless(hasRole('superadmin'))`)
  - **Fail**: `app/Http/Controllers/ChangelogController.php`
  - **Masalah**: Mana-mana pengguna login boleh cipta/edit/padam changelog entries.
  - **Cara Fix**: Tambah `abort_unless($request->user()->hasRole('superadmin'), 403)` pada methods `store`, `update`, `destroy`.
  - **Anggaran Masa**: 30 minit

- [x] **Seragamkan pattern authorization di semua controller** ✅ SELESAI — Gate digunakan untuk operasi sistem, media, announcement, dan changelog
  - **Masalah**: Ada 2 pattern berbeza digunakan:
    - `Gate::authorize('manage-users')` → di `UserController`, `RoleController`
    - `abort_unless($request->user()->hasRole('superadmin'), 403)` → di `SystemSettingsController`, `BackupController`, `LogReaderController`, `HealthMonitorController`
  - **Cara Fix**: Cipta Laravel Policy classes ATAU seragamkan kepada satu pattern sahaja.
  - **Anggaran Masa**: 2-3 jam

---

### 1.4 🟠 Prestasi Segera (Quick Wins)

- [x] **Cache `Setting::values()` — dipanggil 6+ kali setiap request** ✅ SELESAI
  - **Fail**: `app/Models/Setting.php`, `app/Providers/AppServiceProvider.php`, `app/Http/Middleware/HandleInertiaRequests.php`, `app/Http/Middleware/CheckMaintenanceMode.php`
  - **Masalah**: Setiap page load memanggil `Setting::values()` sekurang-kurangnya 6 kali. Setiap panggilan buat query `SELECT * FROM settings`.
  - **Cara Fix**: Guna `Cache::remember()` dengan TTL 60 saat, dan `Cache::forget()` semasa update settings.
  - **Anggaran Masa**: 1-2 jam

  ```php
  // Dalam Setting model:
  public static function values(): array
  {
      return Cache::remember('system.settings', 60, function () {
          // ... existing logic
      });
  }

  public static function setMany(array $values): void
  {
      // ... existing logic
      Cache::forget('system.settings');
  }
  ```

- [x] **Cache `Changelog::latestVersion()` dan `Announcement::active()`** ✅ SELESAI (diliputi oleh cache Setting::values())
  - **Fail**: `app/Models/Changelog.php`, `app/Models/Announcement.php`, `app/Http/Middleware/HandleInertiaRequests.php`
  - **Masalah**: Kedua-dua query ini dipanggil pada SETIAP page load melalui shared props.
  - **Cara Fix**: Cache selama 60 saat dengan `Cache::remember()`.
  - **Anggaran Masa**: 30 minit

---

### 1.5 🟡 Production Hardening

- [x] **Set konfigurasi production yang selamat** ✅ SELESAI
  - **Fail**: `.env`
  - **Tindakan**:
    - Tukar `APP_DEBUG=true` → `APP_DEBUG=false` untuk production
    - Tukar `SESSION_ENCRYPT=false` → `SESSION_ENCRYPT=true`
    - Pastikan `APP_ENV=production` untuk server live
    - Set DB password yang kuat (bukan kosong)
  - **Anggaran Masa**: 15 minit

- [x] **Cipta `.env.production.example`** ✅ SELESAI
  - **Masalah**: `.env.example` guna `APP_DEBUG=true` dan `DB_CONNECTION=sqlite`. Developer mungkin deploy dengan setting development.
  - **Cara Fix**: Cipta `.env.production.example` dengan default yang selamat.
  - **Anggaran Masa**: 15 minit

---

### 1.6 🟢 Pembersihan Kod

- [x] **Padam `database/database.sqlite`** — fail sisa dari setup awal (98KB) ✅ SELESAI
- [x] **Padam atau asingkan demo dashboard widgets** yang bukan fungsi sistem sebenar ✅ SELESAI — widget demo telah dibuang dan Dashboard kini hanya memaparkan data sistem sebenar
  - `resources/js/Pages/DashboardComponents/chat-widget.tsx`
  - `resources/js/Pages/DashboardComponents/exercise-minutes.tsx`
  - `resources/js/Pages/DashboardComponents/latest-payments.tsx`
  - `resources/js/Pages/DashboardComponents/payment-method.tsx`
  - `resources/js/Pages/DashboardComponents/subscriptions.tsx`
  - `resources/js/Pages/DashboardComponents/total-revenue.tsx`
  - `resources/js/Pages/DashboardComponents/theme-members.tsx`
- [x] **Extract `formatBytes()` ke trait atau helper** — fungsi ini di-duplicate dalam 3 controller:
  - `app/Http/Controllers/BackupController.php`
  - `app/Http/Controllers/LogReaderController.php`
  - `app/Http/Controllers/HealthMonitorController.php`
  - **Cara Fix**: Cipta `app/Helpers/FormatHelper.php` atau Trait `app/Traits/FormatsBytes.php` (telah dipindahkan ke `TelemetryService`) ✅ SELESAI

---

## Phase 2 — Jangka Pendek (1–2 Bulan)

> **Objektif**: Perbaiki seni bina, tambah lapisan perkhidmatan, dan sediakan infrastruktur DevOps asas.

### 2.1 🟠 Seni Bina (Architecture)

- [x] **Cipta Service Layer** ✅ SELESAI
  - Cipta folder `app/Services/` dan extract business logic dari controller:
    - [x] `app/Services/TelemetryService.php` — gabungkan logik dari `DashboardController` + `HealthMonitorController` (hapuskan duplikasi ~70 baris) ✅ SELESAI
    - [x] `app/Services/BackupService.php` — logik create/list/delete backup ✅ SELESAI
    - [x] `app/Services/MediaService.php` — logik upload/rename/delete media ✅ SELESAI
    - [x] `app/Services/UserService.php` — logik CRUD user, role assignment, stats ✅ SELESAI
    - [x] `app/Services/AuditService.php` — wrapper untuk `AuditLog::record()` ✅ SELESAI
  - **Anggaran Masa**: 2-3 hari

- [x] **Cipta Form Request classes untuk semua controller** ✅ SELESAI
  - Validation dan authorization telah dipindahkan daripada controller:
    - [x] `app/Http/Requests/StoreUserRequest.php`
    - [x] `app/Http/Requests/UpdateUserRequest.php`
    - [x] `app/Http/Requests/StoreRoleRequest.php`
    - [x] `app/Http/Requests/UpdateRoleRequest.php`
    - [x] `app/Http/Requests/UploadMediaRequest.php`
    - [x] `app/Http/Requests/UpdateSettingsRequest.php`
    - [x] `app/Http/Requests/StoreAnnouncementRequest.php`
    - [x] `app/Http/Requests/UpdateAnnouncementRequest.php`
    - [x] `app/Http/Requests/TestSmtpRequest.php`
  - **Anggaran Masa**: 4-6 jam

- [x] **Cipta Laravel Policy classes untuk authorization** ✅ SELESAI
  - Gate legacy kini dipetakan kepada ability policy untuk kekalkan keserasian route:
    - [x] `app/Policies/UserPolicy.php`
    - [x] `app/Policies/RolePolicy.php`
    - [x] `app/Policies/MediaPolicy.php`
    - [x] `app/Policies/ChangelogPolicy.php`
    - [x] `app/Policies/AnnouncementPolicy.php`
    - [x] `app/Policies/SettingsPolicy.php`
  - **Anggaran Masa**: 3-4 jam

- [x] **Cipta API Resource classes untuk response formatting** ✅ SELESAI
  - Ganti raw array yang dihantar ke Inertia:
    - [ ] `app/Http/Resources/UserResource.php`
    - [ ] `app/Http/Resources/MediaResource.php`
    - [ ] `app/Http/Resources/AuditLogResource.php`
  - **Anggaran Masa**: 2-3 jam

---

### 2.2 🟠 DevOps & Infrastruktur

- [x] **Cipta `Dockerfile` dan `docker-compose.yml`** ✅ SELESAI
  - Services: PHP-FPM, Nginx, MySQL, Redis, Node (untuk Vite build)
  - **Anggaran Masa**: 4-6 jam

- [x] **Cipta CI/CD pipeline (GitHub Actions)** ✅ SELESAI — Pint, PHPUnit, dan Vite build dikuatkuasakan pada setiap push/PR
  - Fail: `.github/workflows/ci.yml`
  - Steps: Install deps → Lint (Pint + ESLint) → Test (PHPUnit) → Build (Vite)
  - **Anggaran Masa**: 3-4 jam

- [x] **Cipta health check API endpoint** ✅ SELESAI
  - Route: `GET /api/health` — return status DB, cache, queue, disk space
  - Digunakan untuk load balancer probe dan monitoring
  - **Anggaran Masa**: 1-2 jam

---

### 2.3 🟡 TypeScript & Frontend

- [x] **Lengkapkan type definitions dalam `resources/js/types/index.d.ts`** ✅ SELESAI
  - **Masalah**: Hanya ada 4 field dalam `User` interface. Tiada type untuk shared props seperti `system`, `notifications`, `flash`, `active_announcement`.
  - **Cara Fix**: Tambah semua interface yang digunakan dalam Inertia shared props.
  - **Anggaran Masa**: 2-3 jam

  ```typescript
  // Contoh types yang perlu ditambah:
  export interface User {
      id: number;
      name: string;
      username: string;  // ← MISSING
      email: string;
      avatar: string | null;  // ← MISSING
      email_verified_at?: string;
      roles: string[];  // ← MISSING
      permissions: string[];  // ← MISSING
  }

  export interface SystemSettings { ... }
  export interface Notification { ... }
  export interface Announcement { ... }
  export interface FlashMessages { ... }
  export interface PageProps { ... }
  ```

- [x] **Paginate media listings (bukan `->get()`)** ✅ SELESAI — 24 item per halaman dengan kawalan Previous/Next
  - **Fail**: `app/Http/Controllers/MediaController.php` (line 45)
  - **Masalah**: `$query->get()` load SEMUA media ke memory. Jika ada 10,000 file, ini akan crash.
  - **Cara Fix**: Tukar ke `$query->paginate(24)` dan update frontend untuk guna pagination.
  - **Anggaran Masa**: 1-2 jam

- [x] **Kurangkan Google Fonts daripada 11 kepada 2-3** ✅ SELESAI
  - **Fail**: `resources/views/app.blade.php`
  - **Masalah**: 11 Google Fonts import menyebabkan render-blocking yang ketara. Kemungkinan hanya Inter dan 1-2 lagi digunakan.
  - **Cara Fix**: Audit penggunaan font dalam CSS, buang yang tidak digunakan, tambah `font-display: swap`.
  - **Anggaran Masa**: 30 minit

---

### 2.4 🟡 Testing

- [x] **Tambah unit tests untuk model methods** ✅ SELESAI
  - [x] Test `Setting::values()` — pastikan caching, boolean casting, integer casting berfungsi
  - [x] Test `Setting::setMany()` — pastikan update/create berfungsi
  - [x] Test `Announcement::active()` — pastikan scheduled dates dan `is_active` filter betul
  - [x] Test `AuditLog::record()` — pastikan semua field disimpan dengan betul
  - [x] Test `Media::getFormattedSizeAttribute()` — pastikan format bytes betul
  - [x] Test `Changelog::latestVersion()` — cache dibersihkan selepas create/update/delete dan versi published terkini dikembalikan dengan betul ✅ SELESAI
  - **Anggaran Masa**: 3-4 jam

- [x] **Tambah feature tests untuk media** ✅ SELESAI — `tests/Feature/MediaManagementTest.php`
  - [x] Test upload file dengan jenis yang dibenarkan
  - [x] Test upload file dengan jenis yang ditolak
  - [x] Test rename media
  - [x] Test delete media
  - [x] Test bulk delete media
  - [x] Test authorization — user biasa tak boleh upload/delete
  - **Anggaran Masa**: 2-3 jam

- [x] **Tambah test untuk `RoleController::destroy()`** ✅ SELESAI
- [x] **Tambah model factories** yang tiada ✅ SELESAI:
  - [x] `database/factories/MediaFactory.php`
  - [x] `database/factories/AnnouncementFactory.php`
  - [x] `database/factories/AuditLogFactory.php`
  - [x] `database/factories/ChangelogFactory.php`
  - **Anggaran Masa**: 1-2 jam

- [x] **Implement `ShouldQueue` pada notification classes** ✅ SELESAI
  - **Fail**: `app/Notifications/AccountAccessChanged.php`, `app/Notifications/SystemSettingsUpdated.php`
  - **Masalah**: Notifications dihantar secara synchronous — melambatkan response HTTP.
  - **Cara Fix**: Tambah `implements ShouldQueue` dan `use Queueable` pada kedua-dua class.
  - **Anggaran Masa**: 30 minit

---

### 2.5 🟡 Dokumentasi

- [x] **Cipta `docs/ERD.md`** — Entity-Relationship Diagram menggunakan Mermaid ✅ SELESAI
- [x] **Cipta `docs/API.md`** — Dokumentasi endpoint API ✅ SELESAI
- [x] **Cipta `DEPLOYMENT.md`** — Panduan deployment Docker dan production ✅ SELESAI
- [x] **Cipta `SECURITY.md`** — Dokumentasi auth flows, RBAC model, security policies ✅ SELESAI
- [x] **Cipta `CONTRIBUTING.md`** — Coding standards dan proses perubahan ✅ SELESAI
- [x] **Cipta `TESTING.md`** — Cara run tests dan build ✅ SELESAI
- **Anggaran Masa**: 2-3 hari

---

## Phase 3 — Jangka Sederhana (3–6 Bulan)

> **Objektif**: Hardening production, monitoring, dan testing komprehensif.

### 3.1 🟠 Monitoring & Observability

- [ ] **Pasang Sentry atau Bugsnag** untuk error monitoring di production
- [ ] **Pasang Laravel Telescope** untuk development debugging (query monitoring, request inspection)
- [ ] **Tambah CSP (Content Security Policy) headers** — middleware untuk XSS mitigation tambahan
- [ ] **Tambah rate limiting pada API routes** — middleware `throttle:60,1` pada semua `/api/*` routes
- [ ] **Tambah rate limiting pada admin operations** — throttle backup creation, cache clearing

### 3.2 🟡 Prestasi & Scalability

- [ ] **Implement Redis** untuk caching, sessions, dan queue (ganti database driver)
- [ ] **Pindahkan backup creation ke queued job** — `CreateBackupJob` supaya tidak block HTTP request
- [ ] **Lazy load heavy frontend components** — Recharts, Media gallery, Kalender
- [ ] **Implement CDN** untuk static assets (CSS, JS, images)
- [ ] **Consolidate user stats queries** dalam `UserController::index()` — 4 `COUNT(*)` → 1 aggregate query

### 3.3 🟡 Testing Lanjutan

- [ ] **Setup Vitest atau Playwright** untuk frontend testing
- [ ] **Cipta E2E tests** untuk critical user flows:
  - [ ] Login → Dashboard → User CRUD
  - [ ] Login → Media Upload → Delete
  - [ ] Login → Settings → Save → Verify changes
  - [ ] 2FA enable → Logout → Login with 2FA
- [ ] **Configure PHPUnit code coverage reporting** — target 70-80%
- [ ] **Tambah database migration tests** — pastikan semua migration up/down berfungsi

### 3.4 🟡 Feature Tambahan

- [ ] **Implement user CSV export** — disebut dalam README tetapi tidak wujud dalam kod
- [ ] **Implement automated scheduled backups** melalui Laravel Scheduler (`app/Console/Kernel.php`)
- [ ] **Tambah audit log search/filter** — carian oleh event, user, tarikh
- [ ] **Tambah audit log pagination** — widget dashboard hanya papar 5 item
- [ ] **Tambah permission-based sidebar menu visibility** — sembunyikan menu item yang user tiada akses

---

## Phase 4 — Jangka Panjang (6–12 Bulan)

> **Objektif**: Perluasan dan penskalaan sistem.

### 4.1 🟢 API & Integrasi

- [ ] **Implement API versioning** — `/api/v1/*` routes dengan proper REST endpoints
- [ ] **Tambah webhook integrations** — Slack/Discord notifications untuk critical events (user deleted, settings changed, backup failed)
- [ ] **Cipta API documentation** menggunakan Swagger/OpenAPI

### 4.2 🟢 Ciri-Ciri Lanjutan

- [ ] **User impersonation mode** — Superadmin boleh lihat sistem sebagai user lain
- [ ] **Internationalization (i18n)** — Tambah sokongan bahasa selain `en` dan `ms`
- [ ] **PWA capabilities** — Service worker untuk offline support dan mobile experience
- [ ] **Multi-tenancy** — Sokongan untuk pelbagai organisasi jika diperlukan
- [ ] **Email template builder** — Ganti `Mail::raw()` dengan templat HTML yang cantik

### 4.3 🟢 Database Optimization

- [ ] **Tambah unique index pada `settings.key`** — `updateOrCreate` tanpa index buat full table scan
- [ ] **Tambah unique index pada `changelogs.version`** — sama seperti di atas
- [ ] **Tambah index pada `changelogs.release_date`** — digunakan dalam `ORDER BY`
- [ ] **Tambah index pada `media.mime_type`** — digunakan dalam filter jenis
- [ ] **Tambah composite index pada `announcements`** — `(is_active, starts_at, ends_at)` untuk query `active()`
- [ ] **Tambah `user_id` pada `media` table** — track siapa upload setiap file
- [ ] **Implement audit log rotation** — auto-purge logs lebih lama dari 90 hari

---

## Ringkasan Skor Sasaran

| Kategori | Skor Semasa | Sasaran Phase 1 | Sasaran Phase 2 | Sasaran Phase 3 |
|---|---|---|---|---|
| Architecture | 5/10 | 5/10 | 7/10 | 8/10 |
| Database | 6/10 | 6/10 | 7/10 | 8/10 |
| Code Quality | 5/10 | 6/10 | 8/10 | 8/10 |
| Security | 4/10 | 7/10 | 8/10 | 9/10 |
| Performance | 5/10 | 6/10 | 7/10 | 8/10 |
| UI/UX | 7/10 | 7/10 | 8/10 | 8/10 |
| Documentation | 4/10 | 4/10 | 7/10 | 8/10 |
| DevOps | 2/10 | 3/10 | 6/10 | 8/10 |
| Testing | 5/10 | 5/10 | 7/10 | 8/10 |
| **OVERALL** | **48/100** | **55/100** | **72/100** | **82/100** |

---

## Keutamaan Segera (Top 5 — Buat HARI INI)

1. ~~✏️ Fix `RoleController::destroy()` bug → **5 minit**~~ ✅ SELESAI
2. ~~✏️ Fix `AnnouncementController` audit log parameter → **10 minit**~~ ✅ SELESAI
3. ~~🔒 Tambah file type whitelist pada media upload → **15 minit**~~ ✅ SELESAI
4. ~~🔒 Tambah authorization pada media routes → **1 jam**~~ ✅ SELESAI
5. ~~⚡ Cache `Setting::values()` → **1-2 jam**~~ ✅ SELESAI

> **✅ Semua Top 5 telah dilaksanakan pada 2026-06-23.**
