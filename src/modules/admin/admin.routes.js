// src/modules/admin/admin.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");
const controller = require("./dashboard.controller");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin endpoints (dashboard, management)
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Ambil statistik dashboard admin (realtime)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Opsional — ambil statistik untuk tanggal ini (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Statistik dashboard
 */
router.get("/dashboard", auth, allowRoles("super_admin", "bk"), controller.getDashboard);

module.exports = router;