Berikut adalah README.md versi profesional, dirancang supaya:

Newbie cepat paham

Developer senior tetap dapat overview arsitektur

Dokumentasi tetap AI-friendly sehingga ChatGPT/AION bisa membaca ulang dan langsung memahami seluruh alur sistem

Struktur rapih, modular, dan bisa langsung dipakai di GitHub


README ini mencakup seluruh fitur, konsep, arsitektur, flow absensi, RBAC, scheduler, upload file, swagger, migration, modular module loader, dan teknologi utama.


---

Attendance Management System – Enterprise Grade (Node.js + Express + Sequelize)

Platform absensi sekolah berbasis sistem akademik modern: mendukung absensi harian, absensi per-jam mapel, validasi guru mapel, rekap lengkap, RBAC, semester, upload bukti file, dan scheduler otomatis.

Dirancang agar newbie mudah belajar, dan developer senior dapat langsung scale.


---

1. Teknologi yang Digunakan

Layer	Teknologi

Backend	Node.js, Express.js
ORM	Sequelize (MySQL/MariaDB)
Auth	JWT Access + Refresh Token
RBAC	Role-Based Access Control
File Upload	Multer
Scheduler	node-cron
Logging	Winston + Daily Rotate File
API Docs	Swagger OpenAPI 3 (Modular YAML)
Architecture	Modular / Domain Driven Design (DDD)
Migration / Seeder	Sequelize CLI Modern



---

2. Fitur Utama Sistem

2.1 Modul Absensi

Absensi Harian (Wali Kelas / Perangkat Kelas)

Absensi Per Jam (Guru Mapel)

Validasi Absensi

Tracking status absensi

Rekap Harian / Bulanan / Kelas

Ranking kehadiran siswa

Riwayat absensi siswa

Export CSV / PDF

Upload bukti (file foto/surat izin)


2.2 Manajemen Data Master

User + Role (RBAC)

Kelas

Jurusan

Mata Pelajaran

Relasi Guru–Mapel–Kelas (GMK)

Semester (aktif & historis)


2.3 Keamanan & Logging

JWT Access + Refresh

Password hashing (bcrypt)

Token versioning

Activity Log

Validation Log


2.4 Scheduler Otomatis

Tiap hari jam 05:00:

1. Auto validate absensi lama


2. Auto reminder siswa alpha tinggi


3. Auto clean orphan files


4. Auto export semester (jika semester berakhir)




---

3. Struktur Proyek

src/
 ├── app.js
 ├── server.js
 ├── config/
 │    ├── db.js
 │    ├── associations.js
 │    ├── scheduler.js
 │    ├── logger.js
 │    └── swagger/
 ├── modules/
 │    ├── absensi/
 │    ├── user/
 │    ├── kelas/
 │    ├── jurusan/
 │    ├── mapel/
 │    ├── gmk/
 │    ├── semester/
 │    ├── file_bukti/
 │    ├── activity_log/
 │    └── validation_log/
 ├── database/
 │    ├── migrations/
 │    ├── seeders/
 │    ├── migrate.js
 │    └── seed.js
 ├── middleware/
 ├── docs/ (Modular Swagger)
 └── uploads/

Arsitektur ini memisahkan controller, service, route, model, validation per modul.


---

4. Alur Kerja Sistem (Business Flow)

4.1 Alur Absensi Harian (Wali Kelas / Perangkat Kelas)

User Input → Absensi Harian → Simpan → Pending Validasi (opsional)

4.2 Alur Absensi Per Jam (Guru Mapel)

Guru Mapel → Input Absensi Jam Ke → Pending Validasi → Guru mapel validasi → Selesai

4.3 Alur Validasi

absensi.is_validated = false → menunggu
guru_mapel klik validasi → log dicatat → selesai

4.4 Alur Semester

Tanggal absensi → dicek masuk semester mana → otomatis semester_id ditentukan

4.5 Scheduler Harian

Jam 05:00:
 - Validasi absensi lama (>= 3 hari)
 - Reminder siswa alpha (>=5 kali)
 - Bersihkan file bukti yatim
 - Export absensi semester jika hari ini akhir semester


---

5. Role & RBAC

Role	Hak Akses

super_admin	Full akses
admin/bk	Monitoring, rekap, pengawasan
wali_kelas	Absensi harian
perangkat_kelas	Absensi harian
guru_mapel	Absensi jam ke, validasi
siswa	Lihat riwayat absensi


Middleware:
auth.middleware.js untuk JWT
rbac.middleware.js untuk role-based control


---

6. Database Schema (Ringkas)

User

id, nisn, email, username

role (enum)

kelas_id, jurusan_id

is_active

last_login


Absensi

student_id

tanggal

jam_ke (nullable)

status

bukti_file

semester_id

mapel_id

created_by

validated_by


FileBukti

filename

original_name

path

mime_type

size

uploaded_by

absensi_id


GMK (Guru–Mapel–Kelas)

guru_id

mapel_id

kelas_id


Semester

tahun_ajaran

semester

start_date / end_date



---

7. API Endpoints (Ringkas)

Auth

POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh

User

CRUD + filter + pagination

Absensi

POST /api/absensi/input-harian
POST /api/absensi/input-jam
POST /api/absensi/validate
GET  /api/absensi/rekap-harian
GET  /api/absensi/rekap-bulanan
GET  /api/absensi/ranking-siswa

File Upload (Absensi)

POST /api/absensi/upload-bukti

Master Data

/api/kelas

/api/jurusan

/api/mapel

/api/guru_mapel_kelas

/api/semester



---

8. Scheduler (Automation System)

Dijalankan setiap hari:

1. Auto validate absensi lama


2. Auto reminder siswa alpha


3. Auto bersihkan file yatim (tidak ada di DB)


4. Auto export semester ke CSV



File konfigurasi: .env

SCHEDULER_CRON_DAILY=0 5 * * *
AUTO_VALIDATE_AFTER_DAYS=3
REMINDER_ALPHA_THRESHOLD=5
AUTO_DELETE_ORPHAN_DAYS=7
AUTO_EXPORT_SEMESTER_DIR=./exports/semester


---

9. Swagger Documentation (Modular YAML)

Folder:

src/docs/
 ├── openapi.yaml
 ├── components/
 ├── paths/
 └── schemas/

Cara akses:

http://localhost:3000/docs


---

10. Cara Menjalankan Proyek

Install dependencies

npm install

Setup Database

1. Buat database absensi_db


2. Pastikan .env terisi



Jalankan Migration

npm run migrate

Jalankan Server

npm run dev


---

11. Folder Upload

uploads/
 ├── bukti/  ← Upload bukti absensi
 └── data-siswa/


---

12. Kualitas Kode

Logging profesional (winston)

Pemisahan layer (controller-service-model)

Validasi input (Joi)

Error handler global

Request ID middleware

Response formatter middleware



---

13. Untuk AI/Developer yang Baru Masuk

Jika developer baru membaca proyek ini, cukup baca:

1. README ini


2. src/modules/<modul>/


3. src/database/migrations/


4. src/config/scheduler.js


5. src/docs/



Maka langsung paham struktur + cara kerja seluruh sistem.


---

14. Lisensi

MIT


---

15. Butuh versi README berbentuk website (mkdocs / docusaurus)?

Katakan saja:
“AION buatkan dokumentasi versi website.”


---

Selesai.
Jika ingin AION membuat README versi premium dengan diagram UML / sequence diagram / ERD, tinggal bilang:
“AION generate ERD + Sequence Diagram.”