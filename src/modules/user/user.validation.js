// src/modules/user/user.validation.js

function validateUser(data) {
    const errors = [];

    if (!data.username) errors.push("username wajib");
    if (!data.nama_lengkap) errors.push("nama_lengkap wajib");
    if (!data.role) errors.push("role wajib");

    const allowed = [
        "super_admin",
        "bk",
        "wali_kelas",
        "guru_mapel",
        "perangkat_kelas",
        "siswa"
    ];

    if (data.role && !allowed.includes(data.role)) {
        errors.push("role tidak valid");
    }

    return errors;
}

module.exports = { validateUser };
