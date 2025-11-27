// src/modules/kelas/kelas.validation.js
function validateCreate(payload) {
    const errors = [];
    if (!payload.nama_kelas || String(payload.nama_kelas).trim() === "") {
        errors.push({ field: "nama_kelas", message: "nama_kelas wajib" });
    }
    if (!payload.jurusan_id) {
        errors.push({ field: "jurusan_id", message: "jurusan_id wajib" });
    }
    if (!payload.tahun_ajaran || String(payload.tahun_ajaran).trim() === "") {
        errors.push({ field: "tahun_ajaran", message: "tahun_ajaran wajib" });
    }
    return errors;
}
function validateUpdate(payload) {
    return validateCreate(payload);
}
module.exports = { validateCreate, validateUpdate };
