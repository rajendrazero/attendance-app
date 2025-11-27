const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");
require("dotenv").config();

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // -------------------------------------------------------
        // 1. Pastikan header authorization tersedia
        // -------------------------------------------------------
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header tidak ditemukan",
                error: "NO_AUTH_HEADER"
            });
        }

        const parts = authHeader.split(" ");

        // -------------------------------------------------------
        // 2. Validasi format "Bearer <token>"
        // -------------------------------------------------------
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Format token tidak valid (gunakan Bearer <token>)",
                error: "INVALID_AUTH_FORMAT"
            });
        }

        const token = parts[1];

        // -------------------------------------------------------
        // 3. Verifikasi JWT
        // -------------------------------------------------------
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Token tidak valid atau kedaluwarsa",
                error: "INVALID_OR_EXPIRED_TOKEN"
            });
        }

        // decoded berisi: { id, role, token_version, iat, exp }

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Payload token tidak lengkap",
                error: "INVALID_TOKEN_PAYLOAD"
            });
        }

        // -------------------------------------------------------
        // 4. Ambil user dari database
        // -------------------------------------------------------
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User tidak ditemukan",
                error: "USER_NOT_FOUND"
            });
        }

        // -------------------------------------------------------
        // 5. Cek apakah user masih aktif
        // -------------------------------------------------------
        if (user.is_active === false) {
            return res.status(403).json({
                success: false,
                message: "Akun dinonaktifkan",
                error: "USER_DISABLED"
            });
        }

        // -------------------------------------------------------
        // 6. Validasi token_version (Anti reuse setelah logout)
        // -------------------------------------------------------
        if (decoded.token_version !== user.token_version) {
            return res.status(401).json({
                success: false,
                message: "Token sudah tidak berlaku. Silakan login ulang.",
                error: "TOKEN_REVOKED"
            });
        }

        // -------------------------------------------------------
        // 7. Inject user ke req (data lengkap)
        // -------------------------------------------------------
        req.user = {
            id: user.id,
            role: user.role,
            nama_lengkap: user.nama_lengkap,
            kelas_id: user.kelas_id,
            jurusan_id: user.jurusan_id,
            token_version: user.token_version
        };

        return next();
    } catch (err) {
        console.error("AUTH MIDDLEWARE ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Kesalahan server pada proses autentikasi",
            error: "AUTH_INTERNAL_ERROR"
        });
    }
};