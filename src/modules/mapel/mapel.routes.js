// src/modules/mapel/mapel.routes.js

const express = require("express");
const router = express.Router();
const controller = require("./mapel.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");

/* ------------------------------------------------------------
 *  SWAGGER TAGS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * tags:
 *   name: Mapel
 *   description: CRUD data Mata Pelajaran
 */

/* ------------------------------------------------------------
 *  MAPEL SCHEMA
 * ------------------------------------------------------------*/
/**
 * @swagger
 * components:
 *   schemas:
 *     Mapel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nama:
 *           type: string
 *           example: "Matematika"
 *         kode:
 *           type: string
 *           example: "MTK"
 *         kategori:
 *           type: string
 *           example: "Wajib"
 *       required:
 *         - nama
 *         - kode
 */

/* ------------------------------------------------------------
 *  CREATE MAPEL
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/mapel:
 *   post:
 *     summary: Tambah mata pelajaran baru
 *     tags: [Mapel]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mapel'
 *     responses:
 *       201:
 *         description: Mapel berhasil dibuat
 */
router.post("/", auth, allowRoles("super_admin"), controller.create);

/* ------------------------------------------------------------
 *  UPDATE MAPEL
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/mapel/{id}:
 *   put:
 *     summary: Update data mapel berdasarkan ID
 *     tags: [Mapel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID mapel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mapel'
 *     responses:
 *       200:
 *         description: Mapel berhasil diperbarui
 */
router.put("/:id", auth, allowRoles("super_admin"), controller.update);

/* ------------------------------------------------------------
 *  DELETE MAPEL
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/mapel/{id}:
 *   delete:
 *     summary: Hapus mapel berdasarkan ID
 *     tags: [Mapel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID mapel
 *     responses:
 *       200:
 *         description: Mapel berhasil dihapus
 */
router.delete("/:id", auth, allowRoles("super_admin"), controller.remove);

/* ------------------------------------------------------------
 *  GET DETAIL MAPEL
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/mapel/{id}:
 *   get:
 *     summary: Ambil detail mapel berdasarkan ID
 *     tags: [Mapel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID mapel
 *     responses:
 *       200:
 *         description: Detail mapel
 */
router.get(
    "/:id",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.get
);

/* ------------------------------------------------------------
 *  LIST MAPEL
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/mapel:
 *   get:
 *     summary: Ambil daftar semua mata pelajaran
 *     tags: [Mapel]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List mapel
 */
router.get(
    "/",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.list
);

module.exports = router;