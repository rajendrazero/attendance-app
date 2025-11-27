// src/modules/guru_mapel_kelas/gmk.validation.js
function validateCreate(payload) {
    const errors = [];
    if (!payload.guru_id)
        errors.push({ field: "guru_id", message: "guru_id wajib" });
    if (!payload.kelas_id)
        errors.push({ field: "kelas_id", message: "kelas_id wajib" });
    if (!payload.mapel_id)
        errors.push({ field: "mapel_id", message: "mapel_id wajib" });
    if (!payload.tahun_ajaran || String(payload.tahun_ajaran).trim() === "")
        errors.push({ field: "tahun_ajaran", message: "tahun_ajaran wajib" });
    return errors;
}
module.exports = { validateCreate };
