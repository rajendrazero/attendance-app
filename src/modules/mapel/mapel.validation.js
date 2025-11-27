// src/modules/mapel/mapel.validation.js
function validate(payload) {
    const errors = [];
    if (!payload.kode_mapel || String(payload.kode_mapel).trim() === "")
        errors.push({ field: "kode_mapel", message: "kode_mapel wajib" });
    if (!payload.nama_mapel || String(payload.nama_mapel).trim() === "")
        errors.push({ field: "nama_mapel", message: "nama_mapel wajib" });
    if (payload.kategori !== undefined) {
        const val = String(payload.kategori || "").trim();
        if (val === "") errors.push({ field: "kategori", message: "kategori tidak boleh kosong jika diisi" });
        if (val.length > 50) errors.push({ field: "kategori", message: "kategori maksimal 50 karakter" });
    }
    return errors;
}
module.exports = { validate };
