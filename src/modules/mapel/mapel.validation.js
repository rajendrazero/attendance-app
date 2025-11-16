// src/modules/mapel/mapel.validation.js
function validate(payload) {
    const errors = [];
    if (!payload.kode_mapel || String(payload.kode_mapel).trim() === "")
        errors.push({ field: "kode_mapel", message: "kode_mapel wajib" });
    if (!payload.nama_mapel || String(payload.nama_mapel).trim() === "")
        errors.push({ field: "nama_mapel", message: "nama_mapel wajib" });
    return errors;
}
module.exports = { validate };
