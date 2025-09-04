
# 💬 ApaPesan - Chat App

**Aplikasi obrolan web *real-time* yang dibangun dengan Laravel & React.js.**

**`🚧 Status: Masih dalam tahap pengembangan 🚧`**

\</div\>

-----

### 📖 Tentang Proyek

**ApaPelan** adalah aplikasi web yang dirancang untuk memfasilitasi komunikasi instan antara pengguna. Dibangun dengan tumpukan teknologi modern, aplikasi ini memungkinkan pengguna untuk mengirim pesan, berbagi file, dan berinteraksi dalam percakapan pribadi atau grup secara *real-time*. Proyek ini memanfaatkan kekuatan Laravel di sisi *backend* dan React.js di sisi *frontend* untuk pengalaman pengguna yang dinamis dan responsif.

-----

### ✨ Fitur Utama

  - 👤 **Autentikasi Pengguna**: Sistem pendaftaran dan *login* yang aman untuk menjaga privasi akun.
  - 💬 **Obrolan Pribadi & Grup**: Mulai percakapan satu lawan satu atau buat ruang obrolan grup untuk diskusi.
  - 🚀 **Pesan *Real-time***: Pesan dikirim dan diterima secara instan tanpa perlu me-*refresh* halaman, berkat *websockets* melalui Laravel Reverb.
  - 📎 **Berbagi Lampiran**: Bagikan gambar, video, audio, dan dokumen PDF dengan mudah di dalam obrolan.
  - 🖼️ **Pratinjau Lampiran**: Lihat pratinjau lampiran seperti gambar, video, dan audio langsung di aplikasi sebelum mengunduh.
  - ⚙️ **Manajemen Pengguna (Admin)**: Kemampuan bagi admin untuk mengelola pengguna lain, seperti memblokir atau memberikan hak akses.

-----


### 💻 Tumpukan Teknologi

| Teknologi | Deskripsi |
| :--- | :--- |
| <img src="https://skillicons.dev/icons?i=laravel" width="25" alt="Laravel"/> **Laravel** | Backend Framework |
| <img src="https://skillicons.dev/icons?i=react" width="25" alt="React"/> **React.js** | Frontend Library |
| <img src="https://skillicons.dev/icons?i=tailwind" width="25" alt="Tailwind CSS"/> **Tailwind CSS** | CSS Framework |
| <img src="https://user-images.githubusercontent.com/22839356/151320295-81a17960-d27a-426a-b286-35b86a877918.png" width="25" alt="Inertia.js"/> **Inertia.js** | Modern Monolith |
| <img src="https://raw.githubusercontent.com/laravel/reverb/main/art/logo.svg" width="25" alt="Laravel Reverb"/> **Laravel Reverb** | Real-time WebSocket Server |

-----

### 🚀 Instalasi dan Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda.

1.  **Clone Repositori**

    ```bash
    git clone https://github.com/rangga11268/apapesan-laravel-project.git
    cd apapesan-laravel-project
    ```

2.  **Instal Dependensi**
    Pastikan Anda memiliki Composer dan Node.js terinstal.

    ```bash
    composer install
    npm install
    ```

3.  **Setup Lingkungan (.env)**
    Salin file `.env.example` dan buat file `.env` baru.

    ```bash
    cp .env.example .env
    ```

    Kemudian, buat kunci aplikasi Laravel.

    ```bash
    php artisan key:generate
    ```

4.  **Konfigurasi Database**
    Atur koneksi database Anda di dalam file `.env`. Secara *default*, proyek ini menggunakan SQLite, yang tidak memerlukan konfigurasi tambahan. Untuk membuatnya, cukup jalankan:

    ```bash
    touch database/database.sqlite
    ```

5.  **Jalankan Migrasi & Seeder**
    Perintah ini akan membuat struktur tabel dan mengisi data awal yang diperlukan.

    ```bash
    php artisan migrate --seed
    ```

6.  **Setup Laravel Reverb**
    Instal dan konfigurasikan Reverb untuk komunikasi *real-time*.

    ```bash
    php artisan reverb:install
    ```

    Pastikan variabel lingkungan Reverb sudah diatur di file `.env` Anda.

7.  **Jalankan Aplikasi**
    Untuk kemudahan, Anda bisa menggunakan perintah `dev` yang sudah disiapkan untuk menjalankan semua layanan yang diperlukan (Vite, Server, Reverb, Queue).

    ```bash
    npm run dev
    ```

    Atau jalankan secara manual di terminal terpisah:

    ```bash
    # Terminal 1: Vite Dev Server
    npm run dev

    # Terminal 2: Laravel Server
    php artisan serve

    # Terminal 3: Reverb WebSocket Server
    php artisan reverb:start

    # Terminal 4: Queue Worker
    php artisan queue:work
    ```

-----

\#\#\#🤝 Kontribusi

Kontribusi sangat kami hargai\! Jika Anda ingin berkontribusi, silakan *fork* repositori ini dan buat *pull request*. Untuk perubahan besar, mohon buka *issue* terlebih dahulu untuk mendiskusikan apa yang ingin Anda ubah.
