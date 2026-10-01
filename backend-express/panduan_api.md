# 🚀 Panduan Lengkap Menjalankan Backend API

## ⚙️ 1. Persiapan Awal

### Step 1 — Setup Database
Buka **phpMyAdmin** (via Laragon → klik kanan tray → phpMyAdmin), lalu:
1. Klik **"New"** → buat database baru bernama `db_pengaduan_simple`
2. Pilih database tersebut → klik tab **SQL**
3. Copy-paste isi file `Mysql.sql` → klik **Go**

> [!IMPORTANT]
> Jika database sudah ada sebelumnya (dengan `password VARCHAR(100)`), jalankan dua baris ALTER ini dulu:
> ```sql
> ALTER TABLE users MODIFY COLUMN password VARCHAR(255);
> UPDATE users SET password='$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email='superadmin@gmail.com';
> ```

### Step 2 — Cek file `.env`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_pengaduan_simple
DB_PORT=3306

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

PORT=3000
```

### Step 3 — Jalankan server
```bash
npm run dev
```
Output yang benar:
```
Server berjalan di port 3000
```

---

## 🧪 2. Tools untuk Testing

Gunakan salah satu:
- **Postman** → [download](https://postman.com)
- **Thunder Client** (extension VSCode)
- **Insomnia**

Base URL: `http://localhost:3000`

---

## 👤 3. ROLE: `user`

### Akun untuk testing — Register dulu
```
POST http://localhost:3000/register
Body (JSON):
{
  "username": "budi",
  "email": "budi@gmail.com",
  "password": "rahasia123"
}
```
Response:
```json
{ "message": "Registrasi berhasil" }
```

### Login
```
POST http://localhost:3000/login
Body (JSON):
{
  "email": "budi@gmail.com",
  "password": "rahasia123"
}
```
Response:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGc...",
  "user": { "id": 2, "username": "budi", "email": "budi@gmail.com", "role": "user" }
}
```
> [!TIP]
> Copy token tersebut. Setiap request yang butuh login harus sertakan header:
> `Authorization: Bearer eyJhbGc...`

### Apa yang bisa dilakukan `user`?

| Endpoint | Method | Butuh Token? | Keterangan |
|----------|--------|:---:|---|
| `/reports` | GET | ❌ | Lihat semua laporan |
| `/reports/:id` | GET | ❌ | Lihat detail laporan |
| `/categories` | GET | ❌ | Lihat semua kategori |
| `/comments/:report_id` | GET | ❌ | Lihat komentar |
| `/reports` | POST | ✅ | Buat laporan baru + upload gambar |
| `/reports/:id` | PUT | ✅ | Edit laporan **miliknya sendiri** |
| `/reports/:id` | DELETE | ✅ | Hapus laporan **miliknya sendiri** |
| `/comments` | POST | ✅ | Tambah komentar |

#### Contoh: Buat Laporan (dengan gambar)
```
POST http://localhost:3000/reports
Header: Authorization: Bearer <token>
Body: form-data (BUKAN JSON, karena ada upload gambar)
  - header     : "Jalan Rusak Depan SD"
  - body       : "Jalan berlubang sangat dalam, berbahaya"
  - category_id: 1
  - image      : [pilih file gambar .jpg/.png]
```

#### Contoh: Edit Laporan Sendiri
```
PUT http://localhost:3000/reports/1
Header: Authorization: Bearer <token>
Body (JSON atau form-data):
{
  "header": "Jalan Rusak Sudah Parah"
}
```
> [!WARNING]
> Jika user mencoba edit/hapus laporan milik orang lain, akan dapat respons:
> `403 Forbidden - "Anda tidak berhak mengedit report ini"`

---

## 🛡️ 4. ROLE: `admin`

### Cara mendapatkan akun admin
Admin **tidak bisa register langsung** dengan role admin (default register = `user`).
Ada dua cara:
1. **Register dulu** → lalu update manual di phpMyAdmin:
   ```sql
   UPDATE users SET role='admin' WHERE email='admin@gmail.com';
   ```
2. Atau **super_admin** bisa mengubah via database (belum ada endpoint edit role di spesifikasi ini)

### Login admin
```
POST http://localhost:3000/login
Body (JSON):
{
  "email": "admin@gmail.com",
  "password": "password_admin"
}
```

### Apa yang bisa dilakukan `admin`?

> Admin bisa semua yang bisa dilakukan `user`, **ditambah**:

| Endpoint | Method | Butuh Token? | Keterangan |
|----------|--------|:---:|---|
| `/categories` | POST | ✅ | Tambah kategori baru |
| `/reports/:id/status` | PATCH | ✅ | Approve / Reject laporan |

#### Contoh: Tambah Kategori
```
POST http://localhost:3000/categories
Header: Authorization: Bearer <token_admin>
Body (JSON):
{
  "category_name": "Infrastruktur"
}
```

#### Contoh: Approve Laporan
```
PATCH http://localhost:3000/reports/1/status
Header: Authorization: Bearer <token_admin>
Body (JSON):
{
  "status": "approved"
}
```
Status valid: `approved` atau `rejected`

> [!WARNING]
> Jika token adalah milik `user` biasa dan mencoba akses endpoint admin:
> `403 Forbidden - "Akses ditolak. Role tidak sesuai."`

---

## 👑 5. ROLE: `super_admin`

### Akun super_admin (sudah ada dari seed)
```
Email   : superadmin@gmail.com
Password: 123
```

### Login super_admin
```
POST http://localhost:3000/login
Body (JSON):
{
  "email": "superadmin@gmail.com",
  "password": "123"
}
```

### Apa yang bisa dilakukan `super_admin`?

> Super admin bisa semua yang bisa admin, **ditambah**:

| Endpoint | Method | Butuh Token? | Keterangan |
|----------|--------|:---:|---|
| `/users` | GET | ✅ | Lihat semua user |
| `/users/:id` | DELETE | ✅ | Hapus user |

#### Contoh: Lihat Semua User
```
GET http://localhost:3000/users
Header: Authorization: Bearer <token_superadmin>
```
Response:
```json
[
  { "id": 1, "username": "superadmin", "email": "superadmin@gmail.com", "role": "super_admin" },
  { "id": 2, "username": "budi", "email": "budi@gmail.com", "role": "user" }
]
```

#### Contoh: Hapus User
```
DELETE http://localhost:3000/users/2
Header: Authorization: Bearer <token_superadmin>
```
Response:
```json
{ "message": "User berhasil dihapus" }
```

---

## 🗺️ 6. Peta Akses Lengkap

| Endpoint | user | admin | super_admin |
|----------|:----:|:-----:|:-----------:|
| `GET /reports` | ✅ | ✅ | ✅ |
| `GET /reports/:id` | ✅ | ✅ | ✅ |
| `GET /categories` | ✅ | ✅ | ✅ |
| `GET /comments/:id` | ✅ | ✅ | ✅ |
| `POST /register` | ✅ | ✅ | ✅ |
| `POST /login` | ✅ | ✅ | ✅ |
| `POST /reports` | ✅ | ✅ | ✅ |
| `PUT /reports/:id` (milik sendiri) | ✅ | ✅ | ✅ |
| `DELETE /reports/:id` (milik sendiri) | ✅ | ✅ | ✅ |
| `POST /comments` | ✅ | ✅ | ✅ |
| `POST /categories` | ❌ | ✅ | ✅ |
| `PATCH /reports/:id/status` | ❌ | ✅ | ✅ |
| `GET /users` | ❌ | ❌ | ✅ |
| `DELETE /users/:id` | ❌ | ❌ | ✅ |

---

## ❌ 7. Pesan Error Umum

| Kode | Pesan | Penyebab |
|------|-------|---------|
| 400 | `"Email dan password wajib diisi"` | Field kosong saat login/register |
| 400 | `"Email sudah terdaftar"` | Email duplikat saat register |
| 401 | `"Token tidak ditemukan"` | Lupa sertakan header `Authorization` |
| 401 | `"Token expired atau tidak valid"` | Token salah atau sudah kadaluarsa |
| 401 | `"Email atau password salah"` | Password tidak cocok |
| 403 | `"Akses ditolak. Role tidak sesuai."` | Role tidak punya izin untuk endpoint ini |
| 403 | `"Anda tidak berhak mengedit report ini"` | Mencoba edit laporan orang lain |
| 404 | `"Report tidak ditemukan"` | ID tidak ada di database |
