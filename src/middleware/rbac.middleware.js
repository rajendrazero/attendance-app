/**
 * RBAC (Role-Based Access Control)
 * Contoh penggunaan:
 * router.post("/absen", auth, allowRoles("perangkat_kelas", "wali_kelas"), controller.input);
 */

const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "User tidak terautentikasi",
          error: "UNAUTHORIZED"
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk aksi ini",
          error: "FORBIDDEN",
          required_roles: allowedRoles,
          your_role: req.user.role
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Kesalahan sistem RBAC",
        error: err.message
      });
    }
  };
};

module.exports = { allowRoles };