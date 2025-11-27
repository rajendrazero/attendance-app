const bcrypt = require("bcryptjs");
const User = require("../user/user.model");
const ActivityLog = require("../activity_log/activityLog.model");

// A. User ganti password sendiri
const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
        const err = new Error("WRONG_PASSWORD");
        err.code = "WRONG_PASSWORD";
        throw err;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    // catat activity
    await ActivityLog.create({
        user_id: userId,
        action: "change_password",
        description: "User mengganti password sendiri"
    });

    return true;
};

// B. Admin reset password user lain
const adminResetPassword = async (adminId, targetUserId, newPassword) => {
    const user = await User.findByPk(targetUserId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    await ActivityLog.create({
        user_id: adminId,
        action: "admin_reset_password",
        description: `Admin mereset password user ID ${targetUserId}`,
        resource: "users",
        resource_id: targetUserId
    });

    return true;
};

module.exports = {
    changePassword,
    adminResetPassword
};