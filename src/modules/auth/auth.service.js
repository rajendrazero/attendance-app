// src/modules/auth/auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const ActivityLog = require("../activity_log/activityLog.model");
const RefreshToken = require("./refreshToken.model");

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "1h"; // e.g. '1h'
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30",
    10
);

const issueAccessToken = user => {
    const payload = {
        id: user.id,
        role: user.role,
        token_version: user.token_version
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES
    });
};

const issueRefreshToken = async user => {
    const payload = {
        id: user.id,
        role: user.role,
        type: "refresh"
    };
    // buat token (lebih panjang masa hidup)
    const token = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        {
            expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d`
        }
    );
    // simpan ke DB supaya bisa di-revoke
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await RefreshToken.create({
        token,
        user_id: user.id,
        expires_at: expiresAt
    });

    return token;
};

const registerUser = async ({
    username,
    password,
    role = "siswa",
    nama_lengkap,
    kelas_id = null,
    jurusan_id = null,
    createdBy = null
}) => {
    // cek duplicate username
    const existing = await User.findOne({ where: { username } });
    if (existing) throw new Error("USERNAME_TAKEN");

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        username,
        password: hash,
        role,
        nama_lengkap,
        kelas_id,
        jurusan_id
    });

    // log activity
    await ActivityLog.create({
        user_id: createdBy || newUser.id,
        action: "register_user",
        description: `User ${username} dibuat.`,
        resource: "users",
        resource_id: newUser.id
    });

    return newUser;
};

const authenticateUser = async (username, password, ip = null, ua = null) => {
    const user = await User.findOne({ where: { username } });
    if (!user) {
        const err = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        const err = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
    }

    // update last_login
    user.last_login = new Date();
    await user.save();

    // buat tokens
    const accessToken = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user);

    // catat activity login
    await ActivityLog.create({
        user_id: user.id,
        action: "login",
        description: "User login berhasil",
        ip_address: ip || null,
        user_agent: ua || null,
        resource: "auth",
        resource_id: null
    });

    return { user, accessToken, refreshToken };
};

const refreshAccessToken = async refreshTokenStr => {
    if (!refreshTokenStr) throw new Error("NO_REFRESH_TOKEN");

    // cek ada di DB
    const stored = await RefreshToken.findOne({
        where: { token: refreshTokenStr }
    });
    if (!stored) {
        const e = new Error("INVALID_REFRESH_TOKEN");
        e.code = "INVALID_REFRESH_TOKEN";
        throw e;
    }

    // verifikasi signatur
    try {
        const decoded = jwt.verify(
            refreshTokenStr,
            process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
        );
        // buat access token baru
        const user = await User.findByPk(decoded.id);
        if (!user) throw new Error("USER_NOT_FOUND");

        const accessToken = issueAccessToken(user);
        return { accessToken };
    } catch (err) {
        // kalau expired atau invalid, hapus dari DB
        await stored.destroy().catch(() => {});
        throw new Error("INVALID_REFRESH_TOKEN");
    }
};

const revokeRefreshToken = async (refreshTokenStr, actorUserId = null) => {
  const stored = await RefreshToken.findOne({ where: { token: refreshTokenStr } });
  if (!stored) return false;

  const user = await User.findByPk(stored.user_id);

  // naikkan token_version → semua access token lama auto invalid
  user.token_version += 1;
  await user.save();

  await stored.destroy();

  await ActivityLog.create({
    user_id: actorUserId || stored.user_id,
    action: "logout",
    description: "Logout: token_version increment",
    resource: "auth",
    resource_id: null
  });

  return true;
};

module.exports = {
    registerUser,
    authenticateUser,
    refreshAccessToken,
    revokeRefreshToken,
    issueAccessToken,
    issueRefreshToken
};
