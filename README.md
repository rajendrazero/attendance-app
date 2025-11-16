=========================================

1. STRUKTUR FOLDER FINAL

=========================================

my-attendance-app/
└── src/
    ├── config/
    │   ├── db.js
    │   ├── associations.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── rbac.middleware.js
    │   └── rateLimit.middleware.js
    ├── modules/
    │   ├── user/
    │   │   ├── user.model.js
    │   ├── activity_log/
    │   │   ├── activityLog.model.js
    │   ├── auth/
    │   │   ├── auth.controller.js
    │   │   ├── auth.service.js
    │   │   ├── password.controller.js
    │   │   ├── password.service.js
    │   │   ├── refreshToken.model.js
    │   │   ├── auth.routes.js
    │   │   └── index.js (opsional)
    ├── app.js
    └── server.js

.env


---

=========================================

2. DEPENDENSI YANG DIPERLUKAN

=========================================

Install:

npm install bcryptjs jsonwebtoken express-rate-limit dotenv


---

=========================================

3. ENVIRONMENT VARIABLES

=========================================

Tambahkan ke .env:

JWT_SECRET=supersecretjwt
REFRESH_TOKEN_SECRET=supersecretrefresh
ACCESS_TOKEN_EXPIRES=1h
REFRESH_TOKEN_EXPIRES_DAYS=30


---

=========================================

4. DATABASE YANG BERHUBUNGAN

=========================================

1. Tabel users

Dipakai untuk login & password storage.

2. Tabel refresh_tokens

Dipakai untuk menyimpan refresh token agar bisa logout/revoke.

3. Tabel activity_log

Mencatat semua aktivitas:

login

logout

register

change_password

admin_reset_password



---

=========================================

5. MIDDLEWARE YANG DIPAKAI

=========================================

A. auth.middleware.js

Verifikasi access token JWT, mengambil:

req.user = {
   id: user_id,
   role: user_role
}


---

B. rbac.middleware.js

Cek role yang diizinkan.

Contoh:

allowRoles("super_admin", "bk")


---

C. rateLimit.middleware.js

Limit login:

max 5x attempt / 5 menit



---

=========================================

6. ROUTES AUTH LENGKAP

=========================================

Semua route berada di:

src/modules/auth/auth.routes.js

Berikut daftar endpoint:

METHOD	URL	AUTH	ROLE	DESKRIPSI

POST	/api/auth/login	public	-	Login username/password
POST	/api/auth/register	optional	super_admin	Membuat user baru
POST	/api/auth/token/refresh	public	-	Membuat access token baru dari refresh token
POST	/api/auth/logout	access_token	user	Logout + revoke refresh token
GET	/api/auth/profile	access_token	user	Melihat profil diri sendiri
POST	/api/auth/change-password	access_token	user	Ganti password sendiri
POST	/api/auth/admin/reset-password/:id	access_token	super_admin	Admin reset password user lain



---

=========================================

7. LOGIKA FITUR-FITUR AUTH

=========================================

Sekarang kita dokumentasikan logika internal setiap operasi.


---

7.1 REGISTER (admin atau publik)

Input:

username
password
role
nama_lengkap
kelas_id
jurusan_id

Langkah logika:

1. Periksa apakah username sudah ada


2. Hash password menggunakan bcrypt 10 salt rounds


3. Buat user baru di DB


4. Catat activity_log:

action: register_user
description: User X dibuat oleh admin Y


5. Return data user



Output:

{ success: true, message: "User berhasil dibuat", data: { ... } }


---

7.2 LOGIN (rate-limit protected)

Input:

username
password

Logika:

1. Cek apakah user ada


2. Compare password vs hash


3. Update last_login


4. Issued access token (JWT)


5. Issued refresh token (JWT) → simpan di DB


6. Catat activity_log (login)


7. Return token & user profile




---

7.3 REFRESH TOKEN

Input:

refresh_token

Logika:

1. Cari refresh token di DB


2. Jika tidak ada → invalid


3. Verifikasi JWT refresh token


4. Ambil user_id dari token


5. Buat access token baru


6. Return access token baru




---

7.4 LOGOUT

Input:

refresh_token

Logika:

1. Cari refresh token di DB


2. Hapus dari DB → token tidak valid lagi


3. Catat activity_log (logout)


4. Return success




---

7.5 GET PROFILE

Logika:

1. Ambil req.user.id dari token


2. Query detail user


3. Return data user




---

7.6 CHANGE PASSWORD (Hanya user sendiri)

Input:

old_password
new_password

Logika:

1. Verify user exist


2. Compare old password


3. Jika gagal → WRONG_PASSWORD


4. Hash new_password


5. Simpan


6. Catat activity_log (change_password)




---

7.7 ADMIN RESET PASSWORD (super_admin only)

Input:

new_password

Logika:

1. Cek user exist


2. Hash new_password


3. Simpan ke DB


4. Catat activity_log (admin_reset_password)




---

=========================================

8. API ROUTE EXAMPLES

=========================================

8.1 LOGIN

POST /api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "password123"
}

Response:

{
  "success": true,
  "data": {
     "token": "<access>",
     "refresh_token": "<refresh>"
  }
}


---

8.2 REFRESH TOKEN

POST /api/auth/token/refresh
{
  "refresh_token": "<token>"
}


---

8.3 LOGOUT

POST /api/auth/logout
Authorization: Bearer <access>

{
  "refresh_token": "<token>"
}


---

8.4 CHANGE PASSWORD (User)

POST /api/auth/change-password
Authorization: Bearer <access>

{
  "old_password": "lama123",
  "new_password": "baru123"
}


---

8.5 ADMIN RESET PASSWORD

POST /api/auth/admin/reset-password/7
Authorization: Bearer <super_admin_access>

{
  "new_password": "passwordBaru77"
}


---

=========================================

9. END-TO-END FLOW

=========================================

1. Register user baru

→ hash password
→ simpan user
→ log “register_user”

2. Login

→ verifikasi username/password
→ masuk DB activity_log
→ generate access + refresh
→ refresh_token disimpan di tabel refresh_tokens

3. Mengakses halaman protected

→ gunakan access_token

4. Access token expired

→ gunakan refresh_token → dapat access_token baru

5. Logout

→ refresh_token dihapus dari DB

6. Ganti password diri sendiri

→ verifikasi old_password
→ hash new_password
→ save
→ activity_log

7. Admin reset password user lain

→ hash new_password
→ save
→ activity_log


---

## Logging System

Aplikasi menggunakan Winston + Daily Rotate File.

### Fitur:
- Log harian otomatis (`logs/app-YYYY-MM-DD.log`)
- Auto-compress & auto-delete (30 hari)
- Integrasi dengan Morgan (HTTP logging)
- Request-ID tracking
- User context logging (userId + role)
- Format JSON → siap dikirim ke ELK/Loki

### Cara kerja Request-ID:
Setiap request memiliki header:
X-Request-ID: <uuid>

Semua log akan memiliki requestId yang sama, sehingga mudah ditrace.

### User Context Logging:
Jika user terautentikasi, setiap log otomatis menyertakan:
- userId
- role


## Monitoring & Tracing

### Opsi 1: ELK Stack (Elasticsearch + Logstash + Kibana)
- Konfigurasi winston transport → Elasticsearch
- Visualisasi log dan tracing
- Query log dengan userId, role, requestId

### Opsi 2: Grafana Loki
- Sangat ringan
- Winston → loki-promtail
- Query dengan label: requestId, userId

### Opsi 3: PM2 Monitoring
- `pm2 monit`
- CPU / Memory live metrics
- Log streaming real-time

### Integrasi Request-ID:
Semua log → memiliki requestId untuk memudahkan tracing:
Contoh:
{
  requestId: "ff3a-11c3-aaa1",
  userId: 1,
  role: "super_admin",
  message: "Validasi absensi"
}