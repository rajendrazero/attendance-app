const express = require("express");
const router = express.Router();

const controller = require("./semester.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");

/**
 * @swagger
 * tags:
 *   - name: Semester
 *     description: Manajemen periode semester akademik sekolah
 */

/**
 * @swagger
 * /api/semester:
 *   get:
 *     summary: Mendapatkan daftar seluruh semester yang tersedia
 *     description: >
 *       Endpoint ini mengembalikan seluruh semester lengkap dengan tahun ajaran, 
 *       nomor semester, status aktif, dan periode tanggal mulai–akhir.
 *
 *       Hanya dapat diakses oleh role **super_admin**.
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semester berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Semester'
 *       401:
 *         description: Token tidak valid atau tidak tersedia
 *       403:
 *         description: Akses ditolak (role tidak diizinkan)
 */
router.get("/", auth, allowRoles("super_admin"), controller.list);

/**
 * @swagger
 * /api/semester/active:
 *   get:
 *     summary: Mendapatkan semester aktif berdasarkan tanggal hari ini
 *     description: >
 *       Sistem akan menentukan semester mana yang sedang aktif dengan membandingkan tanggal sekarang
 *       dengan `start_date` dan `end_date` semester yang sudah terdaftar.
 *
 *       Semua role dapat mengakses endpoint ini.
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Semester aktif ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   $ref: '#/components/schemas/Semester'
 *       404:
 *         description: Tidak ada semester yang aktif pada hari ini
 */
router.get("/active", auth, controller.active);

/**
 * @swagger
 * /api/semester:
 *   post:
 *     summary: Membuat semester baru
 *     description: >
 *       Super Admin dapat membuat semester baru dengan menentukan tahun ajaran, 
 *       nomor semester, dan periode tanggal aktif.
 *
 *       Pastikan periode tidak overlap dengan semester lain.
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tahun_ajaran, semester, start_date, end_date]
 *             properties:
 *               tahun_ajaran:
 *                 type: string
 *                 example: "2025/2026"
 *               semester:
 *                 type: integer
 *                 example: 1
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-20"
 *     responses:
 *       201:
 *         description: Semester berhasil dibuat
 *       400:
 *         description: Validasi gagal / tanggal bentrok
 *       403:
 *         description: Role tidak diperbolehkan
 */
router.post("/", auth, allowRoles("super_admin"), controller.create);

/**
 * @swagger
 * /api/semester/{id}:
 *   put:
 *     summary: Mengupdate data semester yang sudah ada
 *     description: >
 *       Super Admin dapat mengubah periode atau tahun ajaran semester selama
 *       tidak menabrak range semester lain.
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID semester
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Semester'
 *     responses:
 *       200:
 *         description: Semester berhasil diperbarui
 *       404:
 *         description: Semester tidak ditemukan
 *       403:
 *         description: Izin ditolak
 */
router.put("/:id", auth, allowRoles("super_admin"), controller.update);

/**
 * @swagger
 * /api/semester/{id}:
 *   delete:
 *     summary: Menghapus semester dari sistem
 *     description: >
 *       Super Admin dapat menghapus semester selama tidak terpakai
 *       oleh absensi manapun (tidak memiliki dependensi).
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID semester
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Semester berhasil dihapus
 *       400:
 *         description: Semester tidak bisa dihapus karena terpakai
 *       404:
 *         description: Semester tidak ditemukan
 */
router.delete("/:id", auth, allowRoles("super_admin"), controller.remove);

module.exports = router;