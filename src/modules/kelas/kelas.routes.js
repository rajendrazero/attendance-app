// src/modules/kelas/kelas.routes.js

const express = require("express");
const router = express.Router();
const controller = require("./kelas.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");

/* ------------------------------------------------------------
 *  SWAGGER TAGS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * tags:
 *   name: Kelas
 *   description: CRUD data Kelas
 */
/* ------------------------------------------------------------
 *  KELAS SCHEMA
 * ------------------------------------------------------------*/
/**
 * @swagger
 * components:
 *   schemas:
 *     Kelas:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nama_kelas:
 *           type: string
 *           example: "XI RPL 1"
 *         tingkat:
 *           type: integer
 *           example: 11
 *         jurusan_id:
 *           type: integer
 *           example: 3
 *         wali_kelas_id:
 *           type: integer
 *           example: 12
 *         tahun_ajaran:
 *           type: string
 *           example: "2024/2025"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       required:
 *         - nama_kelas
 *         - tingkat
 *         - jurusan_id
 *         - tahun_ajaran
 */


/* ------------------------------------------------------------
 *  CREATE KELAS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/kelas:
 *   post:
 *     summary: Tambah kelas baru
 *     tags: [Kelas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kelas'
 *     responses:
 *       201:
 *         description: Kelas berhasil dibuat
 */
router.post("/", auth, allowRoles("super_admin"), controller.create);

/* ------------------------------------------------------------
 *  UPDATE KELAS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/kelas/{id}:
 *   put:
 *     summary: Update kelas berdasarkan ID
 *     tags: [Kelas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID kelas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kelas'
 *     responses:
 *       200:
 *         description: Kelas berhasil diperbarui
 */
router.put("/:id", auth, allowRoles("super_admin"), controller.update);

/* ------------------------------------------------------------
 *  DELETE KELAS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/kelas/{id}:
 *   delete:
 *     summary: Hapus kelas berdasarkan ID
 *     tags: [Kelas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kelas
 *     responses:
 *       200:
 *         description: Kelas berhasil dihapus
 */
router.delete("/:id", auth, allowRoles("super_admin"), controller.remove);

/* ------------------------------------------------------------
 *  GET DETAIL KELAS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/kelas/{id}:
 *   get:
 *     summary: Ambil detail kelas berdasarkan ID
 *     tags: [Kelas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kelas
 *     responses:
 *       200:
 *         description: Detail kelas
 */
router.get(
    "/:id",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.get
);

/* ------------------------------------------------------------
 *  LIST KELAS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/kelas:
 *   get:
 *     summary: Ambil list semua kelas
 *     tags: [Kelas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar kelas
 */
router.get(
    "/",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.list
);

module.exports = router;