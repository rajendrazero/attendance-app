// src/modules/user/user.routes.js

const express = require("express");
const router = express.Router();
const controller = require("./user.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");
const uploadTo = require("../../middleware/upload.middleware");

/* ------------------------------------------------------------
 *  SWAGGER TAGS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * tags:
 *   name: User
 *   description: Manajemen data pengguna (CRUD + RBAC)
 */

/* ------------------------------------------------------------
 *  USER SCHEMA
 * ------------------------------------------------------------*/
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nisn:
 *           type: string
 *           example: "9988776655"
 *         username:
 *           type: string
 *           example: "siswa001"
 *         nama_lengkap:
 *           type: string
 *           example: "Budi Santoso"
 *         role:
 *           type: string
 *           enum: [super_admin, guru_mapel, wali_kelas, perangkat_kelas, bk, siswa]
 *         kelas_id:
 *           type: integer
 *           example: 3
 *         jurusan_id:
 *           type: integer
 *           example: 2
 *         is_active:
 *           type: boolean
 *           example: true
 *       required:
 *         - username
 *         - nama_lengkap
 *         - role
 */

/* ------------------------------------------------------------
 *  CREATE USER
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Tambahkan user baru
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     description: Hanya super_admin yang boleh membuat user baru.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "guru001"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               nama_lengkap:
 *                 type: string
 *                 example: "Ibu Kurniawati"
 *               role:
 *                 type: string
 *                 example: "guru_mapel"
 *               kelas_id:
 *                 type: integer
 *               jurusan_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 */
router.post("/", auth, allowRoles("super_admin"), controller.create);

/* ------------------------------------------------------------
 *  UPDATE USER
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Update data user berdasarkan ID
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID user
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 */
router.put("/:id", auth, allowRoles("super_admin"), controller.update);

/* ------------------------------------------------------------
 *  DELETE USER
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Hapus user berdasarkan ID
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 */
router.delete("/:id", auth, allowRoles("super_admin"), controller.remove);

/* ------------------------------------------------------------
 *  GET USER DETAIL
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Ambil detail data user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail user
 */
router.get(
    "/:id",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.get
);

/* ------------------------------------------------------------
 *  LIST USERS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Ambil daftar semua user (paginated)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         example: 20
 *     responses:
 *       200:
 *         description: Daftar user
 */
router.get(
    "/",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.list
);

/* ------------------------------------------------------------
 * IMPORT CSV USER
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/user/import:
 *   post:
 *     summary: Import banyak user dari file CSV
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import selesai
 */
router.post(
    "/import",
    auth,
    allowRoles("super_admin"),
    uploadTo("data-siswa").single("file"),
    controller.importCsv
);

/* ------------------------------------------------------------
 * EXPORT CSV USER
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/user/export:
 *   get:
 *     summary: Export semua user ke format CSV
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: File CSV hasil export
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get(
    "/export",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas"),
    controller.exportCsv
);

module.exports = router;
