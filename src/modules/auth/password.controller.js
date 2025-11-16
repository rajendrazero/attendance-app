const passwordService = require("./password.service");


/* ============================================
   CHANGE PASSWORD
============================================ */
const changePassword = async (req, res, next) => {
    try {
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.error(
                "old_password & new_password diperlukan",
                "VALIDATION_ERROR",
                400
            );
        }

        await passwordService.changePassword(
            req.user.id,
            old_password,
            new_password
        );

        return res.success(null, "Password berhasil diganti");
    } catch (err) {
        if (err.code === "WRONG_PASSWORD") {
            return res.error("Password lama salah", "WRONG_PASSWORD", 400);
        }
        return next(err);
    }
};

/* ============================================
   ADMIN RESET PASSWORD
============================================ */
const adminResetPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        if (!new_password)
            return res.error(
                "new_password diperlukan",
                "VALIDATION_ERROR",
                400
            );

        await passwordService.adminResetPassword(req.user.id, id, new_password);

        return res.success(null, "Password user berhasil direset");
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    changePassword,
    adminResetPassword
};
