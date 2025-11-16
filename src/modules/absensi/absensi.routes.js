// src/modules/absensi/absensi.routes.js

const express = require("express");
const router = express.Router();

const controller = require("./absensi.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");
const uploadTo = require("../../middleware/upload.middleware");

/* ------------------------------------------------------------
 *  SWAGGER TAGS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * tags:
 *   name: Absensi
 *   description: API untuk manajemen absensi siswa, validasi guru, rekap harian/bulanan/kelas, dan ekspor data
 */

/* ============================================================
 *  INPUT ABSENSI HARIAN
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/input-harian:
 *   post:
 *     summary: Input absensi harian oleh perangkat kelas / wali kelas
 *     tags: [Absensi]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - tanggal
 *               - status
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 10
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-15"
 *               status:
 *                 type: string
 *                 enum: [hadir, sakit, izin, tanpa_keterangan]
 *               keterangan:
 *                 type: string
 *               bukti:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Input absensi harian berhasil
 */
router.post(
    "/input-harian",
    auth,
    allowRoles("perangkat_kelas", "wali_kelas"),
    uploadTo("bukti").single("bukti"),
    controller.inputHarian
);

/* ============================================================
 *  INPUT ABSENSI JAM
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/input-jam:
 *   post:
 *     summary: Input absensi per jam oleh guru mapel
 *     tags: [Absensi]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - tanggal
 *               - jam_ke
 *               - status
 *             properties:
 *               student_id:
 *                 type: integer
 *               tanggal:
 *                 type: string
 *                 format: date
 *               jam_ke:
 *                 type: integer
 *                 example: 3
 *               status:
 *                 type: string
 *                 enum: [hadir, sakit, izin, tanpa_keterangan]
 *               bukti:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Input absensi per jam berhasil
 */
router.post(
    "/input-jam",
    auth,
    allowRoles("guru_mapel", "wali_kelas"),
    uploadTo("bukti").single("bukti"),
    controller.inputJam
);

/* ============================================================
 *  QUEUE VALIDASI GURU MAPEL
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/validation-queue:
 *   get:
 *     summary: Daftar absensi yang menunggu validasi guru mapel
 *     tags: [Absensi]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
    "/validation-queue",
    auth,
    allowRoles("guru_mapel"),
    controller.getValidationQueue
);

/* ============================================================
 *  VALIDASI ABSENSI
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/validate:
 *   post:
 *     summary: Validasi absensi siswa oleh guru mapel
 *     tags: [Absensi]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               absensi_id:
 *                 type: integer
 *               status_validasi:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
    "/validate",
    auth,
    allowRoles("guru_mapel"),
    controller.validateAbsensi
);

/* ============================================================
 * REKAP HARIAN (WITH SEMESTER_ID)
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/rekap-harian:
 *   get:
 *     summary: Rekap absensi harian (paginated)
 *     tags: [Absensi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *       - in: query
 *         name: end_date
 *       - in: query
 *         name: kelas_id
 *       - in: query
 *         name: jurusan_id
 *       - in: query
 *         name: semester_id
 *         description: Filter berdasarkan semester
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *       - in: query
 *         name: limit
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/rekap-harian", auth, controller.rekapHarian);

/* ============================================================
 * REKAP BULANAN (WITH SEMESTER_ID)
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/rekap-bulanan:
 *   get:
 *     summary: Rekap absensi bulanan berdasarkan periode (YYYY-MM)
 *     tags: [Absensi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periode
 *         required: true
 *       - in: query
 *         name: kelas_id
 *       - in: query
 *         name: semester_id
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/rekap-bulanan", auth, controller.rekapBulanan);

/* ============================================================
 * REKAP KELAS (WITH SEMESTER_ID)
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/rekap-kelas:
 *   get:
 *     summary: Rekap absensi per kelas dalam periode tertentu
 *     tags: [Absensi]
 *     parameters:
 *       - in: query
 *         name: kelas_id
 *         required: true
 *       - in: query
 *         name: periode
 *         required: true
 *       - in: query
 *         name: semester_id
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/rekap-kelas", auth, controller.rekapKelas);

/* ============================================================
 * RANKING SISWA (WITH SEMESTER_ID)
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/ranking-siswa:
 *   get:
 *     summary: Ranking siswa berdasarkan persentase kehadiran
 *     tags: [Absensi]
 *     parameters:
 *       - in: query
 *         name: kelas_id
 *         required: true
 *       - in: query
 *         name: periode
 *       - in: query
 *         name: semester_id
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/ranking-siswa", auth, controller.rankingSiswa);

/* ============================================================
 * RIWAYAT ABSENSI SISWA (WITH SEMESTER_ID)
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/riwayat:
 *   get:
 *     summary: Riwayat absensi khusus siswa login
 *     tags: [Absensi]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *       - in: query
 *         name: end_date
 *       - in: query
 *         name: semester_id
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/riwayat", auth, allowRoles("siswa"), controller.riwayatSiswa);

/* ============================================================
 * EXPORT CSV
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/export/csv:
 *   get:
 *     summary: Export rekap absensi dalam format CSV
 *     tags: [Absensi]
 *     parameters:
 *       - in: query
 *         name: semester_id
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: File CSV
 */
router.get("/export/csv", auth, controller.exportCsv);

/* ============================================================
 * EXPORT PDF
 * ============================================================*/
/**
 * @swagger
 * /api/absensi/export/pdf:
 *   get:
 *     summary: Export rekap absensi dalam format PDF
 *     tags: [Absensi]
 *     parameters:
 *       - in: query
 *         name: semester_id
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: File PDF
 */
router.get("/export/pdf", auth, controller.exportPdf);

module.exports = router;