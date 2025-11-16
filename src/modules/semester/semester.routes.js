const express = require("express");
const router = express.Router();

const controller = require("./semester.controller");
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");

/**
 * @swagger
 * tags:
 *   - name: Semester
 *     description: Manajemen semester sekolah
 */

/**
 * @swagger
 * /api/semester:
 *   get:
 *     summary: Mendapatkan daftar seluruh semester
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 */
router.get("/", auth, allowRoles("super_admin"), controller.list);

/**
 * @swagger
 * /api/semester/active:
 *   get:
 *     summary: Mendapatkan semester aktif berdasarkan tanggal hari ini
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 */
router.get("/active", auth, controller.active);

/**
 * @swagger
 * /api/semester:
 *   post:
 *     summary: Membuat semester baru
 *     tags: [Semester]
 *     security:
 *       - BearerAuth: []
 */
router.post("/", auth, allowRoles("super_admin"), controller.create);

/**
 * @swagger
 * /api/semester/{id}:
 *   put:
 *     summary: Mengupdate semester
 */
router.put("/:id", auth, allowRoles("super_admin"), controller.update);

/**
 * @swagger
 * /api/semester/{id}:
 *   delete:
 *     summary: Menghapus semester
 */
router.delete("/:id", auth, allowRoles("super_admin"), controller.remove);

module.exports = router;