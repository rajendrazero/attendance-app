// src/modules/guru_mapel_kelas/gmk.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./gmk.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");

/* ------------------------------------------------------------
 *  SWAGGER TAGS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * tags:
 *   name: GuruMapelKelas
 *   description: Relasi guru - mapel - kelas (GMK)
 */

/* ------------------------------------------------------------
 *  GMK SCHEMA
 * ------------------------------------------------------------*/
/**
 * @swagger
 * components:
 *   schemas:
 *     GMK:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         guru_id:
 *           type: integer
 *           example: 5
 *         mapel_id:
 *           type: integer
 *           example: 8
 *         kelas_id:
 *           type: integer
 *           example: 3
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
 *         - guru_id
 *         - mapel_id
 *         - kelas_id
 *         - tahun_ajaran
 */

/* ------------------------------------------------------------
 *  CREATE GMK
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/guru_mapel_kelas:
 *   post:
 *     summary: Tambah relasi guru - mapel - kelas
 *     tags: [GuruMapelKelas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GMK'
 *     responses:
 *       201:
 *         description: Relasi GMK berhasil dibuat
 */
router.post("/", auth, allowRoles("super_admin"), controller.create);

/* ------------------------------------------------------------
 *  UPDATE GMK
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/guru_mapel_kelas/{id}:
 *   put:
 *     summary: Update relasi GMK berdasarkan ID
 *     tags: [GuruMapelKelas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID GMK
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GMK'
 *     responses:
 *       200:
 *         description: GMK berhasil diperbarui
 */
router.put("/:id", auth, allowRoles("super_admin"), controller.update);

/* ------------------------------------------------------------
 *  DELETE GMK
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/guru_mapel_kelas/{id}:
 *   delete:
 *     summary: Hapus relasi GMK berdasarkan ID
 *     tags: [GuruMapelKelas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID GMK
 *     responses:
 *       200:
 *         description: GMK berhasil dihapus
 */
router.delete("/:id", auth, allowRoles("super_admin"), controller.remove);

/* ------------------------------------------------------------
 *  GET DETAIL GMK
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/guru_mapel_kelas/{id}:
 *   get:
 *     summary: Ambil detail GMK berdasarkan ID
 *     tags: [GuruMapelKelas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID GMK
 *     responses:
 *       200:
 *         description: Detail GMK
 */
router.get(
    "/:id",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.get
);

/* ------------------------------------------------------------
 *  LIST GMK
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/guru_mapel_kelas:
 *   get:
 *     summary: List semua relasi GMK
 *     tags: [GuruMapelKelas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: guru_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mapel_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: kelas_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Daftar GMK
 */
router.get(
    "/",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.list
);

module.exports = router;
