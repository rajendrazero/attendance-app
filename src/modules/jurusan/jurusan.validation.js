// src/modules/jurusan/jurusan.validation.js
function validateCreate(payload) {
  const errors = [];
  if (!payload.kode_jurusan || String(payload.kode_jurusan).trim() === "") {
    errors.push({ field: "kode_jurusan", message: "kode_jurusan wajib" });
  }
  if (!payload.nama_jurusan || String(payload.nama_jurusan).trim() === "") {
    errors.push({ field: "nama_jurusan", message: "nama_jurusan wajib" });
  }
  return errors;
}

function validateUpdate(payload) {
  return validateCreate(payload);
}

module.exports = { validateCreate, validateUpdate };