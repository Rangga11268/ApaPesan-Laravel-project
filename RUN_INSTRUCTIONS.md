# Cara Menjalankan ApaPesan (Midnight Aurora Edition)

Untuk menjalankan aplikasi ini secara penuh (termasuk fitur Real-time Chat), Anda perlu membuka **4 Terminal** berbeda dan menjalankan perintah berikut di setiap terminal:

### 1. Backend Server (Laravel)

Menjalankan server PHP.

```bash
php artisan serve
```

_Akses web di:_ `http://localhost:8000`

### 2. Frontend Server (Vite)

Menjalankan build system untuk React & Tailwind (Hot Module Replacement).

```bash
npm run dev
```

### 3. WebSocket Server (Reverb)

Menjalankan server WebSocket untuk fitur chat real-time (agar pesan masuk tanpa refresh).

```bash
php artisan reverb:start
```

### 4. Queue Worker

Menjalankan background process untuk memproses event broadcasting.

```bash
php artisan queue:work
```

---

### ⚠️ Catatan Penting: Perekaman Suara (Audio Recorder)

Browser modern memblokir akses mikrofon pada koneksi yang tidak aman (HTTP), kecuali `localhost`.

-   **Bisa Merekam:** Buka aplikasi via `http://localhost:8000`
-   **Tidak Bisa Merekam:** Buka aplikasi via `http://apapesan.test` (kecuali Anda sudah setting SSL/HTTPS di Laragon)

Jika muncul error "Audio recording is not supported", pastikan Anda mengakses via **localhost**.
