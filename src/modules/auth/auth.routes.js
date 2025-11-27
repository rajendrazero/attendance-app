// src/modules/auth/auth.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const { allowRoles } = require("../../middleware/rbac.middleware");
const { loginRateLimit } = require("../../middleware/rateLimit.middleware.js");
const passwordController = require("./password.controller");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API untuk autentikasi dan manajemen password
 */

/* ============================================================
   LOGIN
============================================================ */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user ke sistem
 *     description: Menghasilkan access token dan refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Kredensial salah
 */
router.post("/login", loginRateLimit, controller.login);

/* ============================================================
   REGISTER (Admin only)
============================================================ */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Membuat user baru (khusus super_admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, bk, wali_kelas, guru_mapel, perangkat_kelas, siswa]
 *               nama_lengkap:
 *                 type: string
 *               kelas_id:
 *                 type: integer
 *               jurusan_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Username sudah dipakai
 */
router.post(
    "/register",
    authMiddleware,
    allowRoles("super_admin"),
    controller.register
);

/* ============================================================
   REFRESH TOKEN
============================================================ */
/**
 * @swagger
 * /api/auth/token/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Memperbarui access token menggunakan refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *       401:
 *         description: Refresh token invalid
 */
router.post("/token/refresh", controller.refreshToken);

/* ============================================================
   LOGOUT
============================================================ */
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user dan hapus refresh token
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
router.post("/logout", authMiddleware, controller.logout);

/* ============================================================
   PROFILE
============================================================ */
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Mengambil profil user yang sedang login
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil ditampilkan
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/profile", authMiddleware, controller.profile);

/* ============================================================
   CHANGE PASSWORD (Self)
============================================================ */
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Ganti password (user sendiri)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_password
 *               - new_password
 *             properties:
 *               old_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password berhasil diganti
 *       400:
 *         description: Password lama salah
 */
router.post(
    "/change-password",
    authMiddleware,
    passwordController.changePassword
);

/* ============================================================
   ADMIN RESET PASSWORD USER LAIN
============================================================ */
/**
 * @swagger
 * /api/auth/admin/reset-password/{id}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password user lain (khusus super_admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user target
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password berhasil direset
 */
router.post(
    "/admin/reset-password/:id",
    authMiddleware,
    allowRoles("super_admin"),
    passwordController.adminResetPassword
);

module.exports = router;