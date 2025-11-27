// src/modules/absensi/absensi.helper.js
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const Semester = require("../semester/semester.model");

/* -----------------------------------------------------
 * VALIDASI JAM KE
 * ----------------------------------------------------*/
function isValidJam(jam) {
    return Number.isInteger(jam) && jam >= 1 && jam <= 12;
}

/* -----------------------------------------------------
 * HAPUS FILE UPLOAD (rollback)
 * ----------------------------------------------------*/
function deleteUploadedFile(file) {
    if (!file) return;

    const fullPath = path.join(
        __dirname,
        "../../..",
        "uploads/bukti",
        file.filename
    );

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`[absensi.helper] Deleted file rollback: ${file.filename}`);
    }
}

/* -----------------------------------------------------
 * CARI SEMESTER BERDASARKAN TANGGAL
 * ----------------------------------------------------*/
async function findSemesterByDate(tanggal) {
    return Semester.findOne({
        where: {
            start_date: { [Op.lte]: tanggal },
            end_date: { [Op.gte]: tanggal }
        }
    });
}

module.exports = {
    isValidJam,
    deleteUploadedFile,
    findSemesterByDate
};
