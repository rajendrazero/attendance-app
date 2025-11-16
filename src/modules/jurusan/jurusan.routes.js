// src/modules/jurusan/jurusan.routes.js

const express = require("express");
const router = express.Router();
const controller = require("./jurusan.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");

/* ------------------------------------------------------------
 *  SWAGGER TAGS
 * ------------------------------------------------------------*/
/**
 * @swagger
 * tags:
 *   name: Jurusan
 *   description: CRUD data jurusan
 */

/* ------------------------------------------------------------
 *  Jurusan Schema
 * ------------------------------------------------------------*/
/**
 * @swagger
 * components:
 *   schemas:
 *     Jurusan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nama:
 *           type: string
 *         kode:
 *           type: string
 *       required:
 *         - nama
 *         - kode
 */

/* ------------------------------------------------------------
 *  CREATE JURUSAN
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/jurusan:
 *   post:
 *     summary: Tambah data jurusan
 *     tags: [Jurusan]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Rekayasa Perangkat Lunak
 *               kode:
 *                 type: string
 *                 example: RPL
 *     responses:
 *       201:
 *         description: Jurusan berhasil dibuat
 */
router.post("/", auth, allowRoles("super_admin"), controller.create);

/* ------------------------------------------------------------
 *  UPDATE JURUSAN
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/jurusan/{id}:
 *   put:
 *     summary: Update data jurusan berdasarkan ID
 *     tags: [Jurusan]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID jurusan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Jurusan'
 *     responses:
 *       200:
 *         description: Jurusan berhasil diperbarui
 */
router.put("/:id", auth, allowRoles("super_admin"), controller.update);

/* ------------------------------------------------------------
 *  DELETE JURUSAN
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/jurusan/{id}:
 *   delete:
 *     summary: Hapus jurusan berdasarkan ID
 *     tags: [Jurusan]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID jurusan
 *     responses:
 *       200:
 *         description: Jurusan berhasil dihapus
 */
router.delete("/:id", auth, allowRoles("super_admin"), controller.remove);

/* ------------------------------------------------------------
 *  GET DETAIL JURUSAN
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/jurusan/{id}:
 *   get:
 *     summary: Ambil detail jurusan berdasarkan ID
 *     tags: [Jurusan]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID jurusan
 *     responses:
 *       200:
 *         description: Detail jurusan
 */
router.get(
    "/:id",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.get
);

/* ------------------------------------------------------------
 *  LIST JURUSAN
 * ------------------------------------------------------------*/
/**
 * @swagger
 * /api/jurusan:
 *   get:
 *     summary: Ambil daftar semua jurusan
 *     tags: [Jurusan]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar jurusan
 */
router.get(
    "/",
    auth,
    allowRoles("super_admin", "bk", "wali_kelas", "guru_mapel"),
    controller.list
);

module.exports = router;