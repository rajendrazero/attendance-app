// src/modules/absensi/absensi.controller.js

const absensiService = require("./absensi.service");

/* ============================================================
 * INPUT ABSENSI HARIAN
 * ============================================================*/
const inputHarian = async (req, res, next) => {
    try {
        const result = await absensiService.inputAbsensiHarian({
            ...req.body,
            created_by: req.user.id,
            file: req.file || null
        });

        return res.success(result, "Absensi harian berhasil diinput");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * INPUT ABSENSI JAM
 * ============================================================*/
const inputJam = async (req, res, next) => {
    try {
        const result = await absensiService.inputAbsensiJam({
            ...req.body,
            created_by: req.user.id,
            file: req.file || null
        });

        return res.success(result, "Absensi per jam berhasil diinput");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * QUEUE VALIDASI
 * ============================================================*/
const getValidationQueue = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await absensiService.getValidationQueue(req.user.id, page, limit);
        return res.success(result, "Daftar absensi menunggu validasi");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * VALIDASI ABSENSI
 * ============================================================*/
const validateAbsensi = async (req, res, next) => {
    try {
        const result = await absensiService.validateAbsensi(
            req.body,
            req.user.id
        );
        return res.success(result, "Absensi berhasil divalidasi");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * REKAP HARIAN
 * ============================================================*/
const rekapHarian = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await absensiService.rekapHarian({
            ...req.query,
            semester_id: req.query.semester_id || null,
            page,
            limit
        });

        return res.success(result, "Rekap harian berhasil diambil");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * REKAP BULANAN
 * ============================================================*/
const rekapBulanan = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await absensiService.rekapBulanan({
            ...req.query,
            semester_id: req.query.semester_id || null,
            page,
            limit
        });

        return res.success(result, "Rekap bulanan berhasil diambil");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * REKAP PER KELAS
 * ============================================================*/
const rekapKelas = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await absensiService.rekapKelas({
            kelas_id: req.query.kelas_id,
            periode: req.query.periode || req.query.period || null,
            semester_id: req.query.semester_id || null,
            page,
            limit
        });

        return res.success(result, "Rekap kelas berhasil diambil");
    } catch (err) {
        return next(err);
    }
};


/* ============================================================
 * RANKING SISWA
 * ============================================================*/
const rankingSiswa = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await absensiService.rankingSiswa({
            ...req.query,
            semester_id: req.query.semester_id || null,
            page,
            limit
        });

        return res.success(result, "Ranking siswa berhasil diambil");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * RIWAYAT SISWA
 * ============================================================*/
const riwayatSiswa = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await absensiService.riwayatSiswa({
            student_id: req.user.id,
            ...req.query,
            semester_id: req.query.semester_id || null,
            page,
            limit
        });

        return res.success(result, "Riwayat absensi siswa");
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * EXPORT CSV
 * ============================================================*/
const exportCsv = async (req, res, next) => {
    try {
        const csv = await absensiService.exportCsv({
            ...req.query,
            semester_id: req.query.semester_id || null
        });

        res.header("Content-Type", "text/csv");
        res.attachment("rekap_absensi.csv");

        return res.send(csv);
    } catch (err) {
        return next(err);
    }
};

/* ============================================================
 * EXPORT PDF
 * ============================================================*/
const exportPdf = async (req, res, next) => {
    try {
        const pdfBuffer = await absensiService.exportPdf({
            ...req.query,
            semester_id: req.query.semester_id || null
        });

        res.header("Content-Type", "application/pdf");
        res.attachment("rekap_absensi.pdf");

        return res.send(pdfBuffer);
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    inputHarian,
    inputJam,
    getValidationQueue,
    validateAbsensi,
    rekapHarian,
    rekapBulanan,
    rekapKelas,
    rankingSiswa,
    riwayatSiswa,
    exportCsv,
    exportPdf
};