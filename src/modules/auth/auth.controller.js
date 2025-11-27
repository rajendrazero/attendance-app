// src/modules/auth/auth.controller.js
const authService = require("./auth.service");
const User = require("../user/user.model");

/* ============================================
   LOGIN
============================================ */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.headers["x-forwarded-for"] || null;
        const ua = req.headers["user-agent"] || null;

        const { user, accessToken, refreshToken } =
            await authService.authenticateUser(username, password, ip, ua);

        return res.success(
            {
                token: accessToken,
                refresh_token: refreshToken,
                user: {
                    id: user.id,
                    nisn: user.nisn || null,
                    username: user.username,
                    nama_lengkap: user.nama_lengkap,
                    role: user.role,
                    kelas_id: user.kelas_id,
                    jurusan_id: user.jurusan_id,
                    last_login: user.last_login
                }
            },
            "Login berhasil"
        );
    } catch (err) {
        if (err.code === "INVALID_CREDENTIALS") {
            return res.error(
                "Username atau password salah",
                "INVALID_CREDENTIALS",
                401
            );
        }
        return next(err);
    }
};

/* ============================================
   REGISTER
============================================ */
const register = async (req, res, next) => {
    try {
        const { username, password, role, nama_lengkap, kelas_id, jurusan_id } =
            req.body;

        const createdBy = req.user ? req.user.id : null;

        const user = await authService.registerUser({
            username,
            password,
            role,
            nama_lengkap,
            kelas_id,
            jurusan_id,
            createdBy
        });

        return res.success(
            {
                id: user.id,
                nisn: user.nisn || null,
                username: user.username,
                nama_lengkap: user.nama_lengkap,
                role: user.role,
                kelas_id: user.kelas_id,
                jurusan_id: user.jurusan_id,
                is_active: user.is_active
            },
            "User berhasil dibuat",
            201
        );
    } catch (err) {
        if (err.message === "USERNAME_TAKEN") {
            return res.error("Username sudah dipakai", "USERNAME_TAKEN", 400);
        }
        return next(err);
    }
};

/* ============================================
   REFRESH TOKEN
============================================ */
const refreshToken = async (req, res, next) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token)
            return res.error(
                "refresh_token diperlukan",
                "NO_REFRESH_TOKEN",
                400
            );

        const { accessToken } =
            await authService.refreshAccessToken(refresh_token);

        return res.success({ token: accessToken }, "Access token diperbarui");
    } catch (err) {
        return res.error(
            "Refresh token kadaluwarsa atau tidak valid",
            "INVALID_REFRESH_TOKEN",
            401
        );
    }
};

/* ============================================
   LOGOUT
============================================ */
const logout = async (req, res, next) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token)
            return res.error(
                "refresh_token diperlukan",
                "NO_REFRESH_TOKEN",
                400
            );

        const actor = req.user ? req.user.id : null;
        const ok = await authService.revokeRefreshToken(refresh_token, actor);

        if (!ok)
            return res.error("Refresh token tidak ditemukan", "NOT_FOUND", 400);

        return res.success(null, "Logout berhasil");
    } catch (err) {
        return next(err);
    }
};

/* ============================================
   PROFILE
============================================ */
const profile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: [
                "id",
                "nisn",
                "username",
                "nama_lengkap",
                "role",
                "kelas_id",
                "jurusan_id",
                "last_login"
            ]
        });

        if (!user) return res.error("User tidak ditemukan", "NOT_FOUND", 404);

        return res.success(user, "Data pengguna");
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    login,
    register,
    refreshToken,
    logout,
    profile
};
