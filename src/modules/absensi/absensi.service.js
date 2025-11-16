const { fromSequelizeFindAndCount } = require("../../utils/pagination");
const Absensi = require("./absensi.model");
const User = require("../user/user.model");
const Mapel = require("../mapel/mapel.model");
const GuruMapelKelas = require("../guru_mapel_kelas/gmk.model");
const FileBukti = require("../file_bukti/fileBukti.model");
const ValidationLog = require("../validation_log/validationLog.model");
const ActivityLog = require("../activity_log/activityLog.model");
const { validateInputAbsensi } = require("./absensi.validation");
const { isValidJam, deleteUploadedFile } = require("./absensi.helper");
const { Op } = require("sequelize");
const Kelas = require("../kelas/kelas.model");
const Jurusan = require("../jurusan/jurusan.model");
const Semester = require("../semester/semester.model");

// export tools
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

class AbsensiService {
    /* -----------------------------------------------------
     * HELPER: CARI SEMESTER BERDASARKAN TANGGAL
     * ----------------------------------------------------*/
    async findSemesterByDate(tanggal) {
        return Semester.findOne({
            where: {
                start_date: { [Op.lte]: tanggal },
                end_date: { [Op.gte]: tanggal }
            }
        });
    }

    /* -----------------------------------------------------
     * INPUT ABSENSI HARIAN
     * ----------------------------------------------------*/
    async inputAbsensiHarian(data) {
        let createdFile = null;

        try {
            const errors = validateInputAbsensi(data);
            if (errors.length > 0) {
                const err = new Error("VALIDATION_ERROR");
                err.details = errors;
                err.status = 400;
                throw err;
            }

            let { student_id, tanggal, status, keterangan, created_by, file } = data;

            const siswa = await User.findByPk(student_id);
            if (!siswa) {
                const err = new Error("SISWA_TIDAK_DITEMUKAN");
                err.status = 404;
                throw err;
            }

            // CHECK DUPLICATE
            const exist = await Absensi.findOne({
                where: { student_id, tanggal, jam_ke: null }
            });

            if (exist) {
                const err = new Error("SUDAH_ABSEN_HARIAN");
                err.status = 400;
                throw err;
            }

            // CARI SEMESTER
            const semester = await this.findSemesterByDate(tanggal);
            if (!semester) {
                const err = new Error("SEMESTER_TIDAK_DITEMUKAN");
                err.status = 400;
                throw err;
            }

            // SIMPAN FILE
            let bukti_file = null;
            if (file) {
                createdFile = file.filename;
                bukti_file = `/uploads/bukti/${file.filename}`;
            }

            // SIMPAN ABSENSI
            const absensi = await Absensi.create({
                student_id,
                tanggal,
                jam_ke: null,
                status,
                keterangan,
                bukti_file,
                created_by,
                semester_id: semester.id,
                is_validated: false
            });

            // ACTIVITY LOG
            await ActivityLog.create({
                user_id: created_by,
                action: "input_absensi_harian",
                description: `Input absensi harian untuk siswa ID ${student_id}`,
                resource: "absensi",
                resource_id: absensi.id
            });

            return absensi;
        } catch (err) {
            if (createdFile) deleteUploadedFile({ filename: createdFile });
            throw err;
        }
    }

    /* -----------------------------------------------------
     * INPUT ABSENSI PER-JAM
     * ----------------------------------------------------*/
    async inputAbsensiJam(data) {
        let createdFile = null;

        try {
            const errors = validateInputAbsensi(data);
            if (errors.length > 0) {
                const err = new Error("VALIDATION_ERROR");
                err.details = errors;
                err.status = 400;
                throw err;
            }

            let { student_id, tanggal, jam_ke, status, keterangan, created_by, file } = data;

            if (!jam_ke || !isValidJam(jam_ke)) {
                const err = new Error("JAM_KE_TIDAK_VALID");
                err.status = 400;
                throw err;
            }

            const siswa = await User.findByPk(student_id);
            if (!siswa) {
                const err = new Error("SISWA_TIDAK_DITEMUKAN");
                err.status = 404;
                throw err;
            }

            const relasiGMK = await GuruMapelKelas.findOne({
                where: { guru_id: created_by, kelas_id: siswa.kelas_id }
            });

            if (!relasiGMK) {
                const err = new Error("GURU_TIDAK_MENGAMPU_KELAS_INI");
                err.status = 403;
                throw err;
            }

            const exist = await Absensi.findOne({
                where: { student_id, tanggal, jam_ke }
            });

            if (exist) {
                const err = new Error("SUDAH_ABSEN_JAM_KE");
                err.status = 400;
                throw err;
            }

            // CARI SEMESTER
            const semester = await this.findSemesterByDate(tanggal);
            if (!semester) {
                const err = new Error("SEMESTER_TIDAK_DITEMUKAN");
                err.status = 400;
                throw err;
            }

            let bukti_file = null;
            if (file) {
                createdFile = file.filename;
                bukti_file = `/uploads/bukti/${file.filename}`;
            }

            const absensi = await Absensi.create({
                student_id,
                tanggal,
                jam_ke,
                status,
                keterangan,
                bukti_file,
                created_by,
                mapel_id: relasiGMK.mapel_id,
                semester_id: semester.id,
                is_validated: false
            });

            await ActivityLog.create({
                user_id: created_by,
                action: "input_absensi_jam",
                description: `Input absensi jam-ke ${jam_ke} untuk siswa ID ${student_id}`,
                resource: "absensi",
                resource_id: absensi.id
            });

            return absensi;
        } catch (err) {
            if (createdFile) deleteUploadedFile({ filename: createdFile });
            throw err;
        }
    }

    /* -----------------------------------------------------
     * QUEUE VALIDASI
     * ----------------------------------------------------*/
    async getValidationQueue() {
        return Absensi.findAll({
            where: { is_validated: false },
            include: [
                { model: User, as: "siswa" },
                { model: Mapel, as: "mapel" }
            ]
        });
    }

    /* -----------------------------------------------------
     * VALIDASI ABSENSI
     * ----------------------------------------------------*/
    async validateAbsensi({ absensi_id, status_validasi }, guruId) {
        const absensi = await Absensi.findByPk(absensi_id);
        if (!absensi) {
            const err = new Error("ABSENSI_TIDAK_DITEMUKAN");
            err.status = 404;
            throw err;
        }

        absensi.validated_by = guruId;
        absensi.validated_at = new Date();
        absensi.is_validated = true;
        await absensi.save();

        await ValidationLog.create({
            absensi_id,
            validator_id: guruId,
            keterangan: status_validasi
        });

        await ActivityLog.create({
            user_id: guruId,
            action: "validasi_absensi",
            description: `Validasi absensi ID ${absensi_id}`,
            resource: "absensi",
            resource_id: absensi_id
        });

        return absensi;
    }

    /* -----------------------------------------------------
     * REKAP HARIAN
     * ----------------------------------------------------*/
    async rekapHarian({ start_date, end_date, kelas_id, jurusan_id, semester_id, page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;

        const where = {};
        if (start_date && end_date)
            where.tanggal = { [Op.between]: [start_date, end_date] };
        if (semester_id) where.semester_id = semester_id;
        if (kelas_id) where["$siswa.kelas_id$"] = kelas_id;
        if (jurusan_id) where["$siswa.jurusan_id$"] = jurusan_id;

        const result = await Absensi.findAndCountAll({
            where,
            limit,
            offset,
            order: [["tanggal", "DESC"]],
            include: [
                {
                    model: User,
                    as: "siswa",
                    include: [{ model: Kelas, as: "kelas" }]
                },
                { model: Mapel, as: "mapel" },
                { model: Semester, as: "semester" }
            ]
        });

        return fromSequelizeFindAndCount(result, page, limit);
    }

    /* -----------------------------------------------------
     * REKAP BULANAN
     * ----------------------------------------------------*/
    async rekapBulanan({ periode, kelas_id, semester_id }) {
        if (!periode) throw new Error("PERIODE_REQUIRED");

        const [year, month] = periode.split("-");
        const start = `${year}-${month}-01`;
        const end = `${year}-${month}-31`;

        return Absensi.findAll({
            where: {
                tanggal: { [Op.between]: [start, end] },
                ...(semester_id && { semester_id }),
                ...(kelas_id && { "$siswa.kelas_id$": kelas_id })
            },
            include: [
                { model: User, as: "siswa", include: [{ model: Kelas, as: "kelas" }] },
                { model: Mapel, as: "mapel" },
                { model: Semester, as: "semester" }
            ]
        });
    }

    /* -----------------------------------------------------
     * REKAP PER KELAS
     * ----------------------------------------------------*/
    async rekapKelas({ kelas_id, periode, semester_id }) {
        if (!kelas_id) throw new Error("KELAS_ID_REQUIRED");
        if (!periode) throw new Error("PERIODE_REQUIRED");

        const [year, month] = periode.split("-");
        const start = `${year}-${month}-01`;
        const end = `${year}-${month}-31`;

        return Absensi.findAll({
            where: {
                "$siswa.kelas_id$": kelas_id,
                tanggal: { [Op.between]: [start, end] },
                ...(semester_id && { semester_id })
            },
            include: [
                { model: User, as: "siswa" },
                { model: Mapel, as: "mapel" },
                { model: Semester, as: "semester" }
            ]
        });
    }

    /* -----------------------------------------------------
     * RANKING SISWA
     * ----------------------------------------------------*/
    async rankingSiswa({ kelas_id, periode = null, semester_id = null, limit = 10 }) {
        if (!kelas_id) throw new Error("KELAS_ID_REQUIRED");

        const where = { "$siswa.kelas_id$": kelas_id };

        let startDate, endDate;
        if (periode) {
            const [year, month] = periode.split("-");
            startDate = `${year}-${month}-01`;
            endDate = `${year}-${month}-31`;
            where.tanggal = { [Op.between]: [startDate, endDate] };
        }

        if (semester_id) where.semester_id = semester_id;

        const absensi = await Absensi.findAll({
            where,
            include: [{ model: User, as: "siswa" }]
        });

        const ranking = {};

        for (const a of absensi) {
            const sid = a.student_id;

            if (!ranking[sid]) {
                ranking[sid] = {
                    student_id: sid,
                    nama_siswa: a.siswa.nama_lengkap,
                    nisn: a.siswa.nisn,
                    hadir: 0,
                    sakit: 0,
                    izin: 0,
                    alpha: 0
                };
            }

            if (a.status === "hadir") ranking[sid].hadir++;
            if (a.status === "sakit") ranking[sid].sakit++;
            if (a.status === "izin") ranking[sid].izin++;
            if (a.status === "tanpa_keterangan") ranking[sid].alpha++;
        }

        const final = Object.values(ranking).map(r => {
            const totalPertemuan = r.hadir + r.sakit + r.izin + r.alpha;
            const persentase = totalPertemuan === 0
                ? 0
                : (r.hadir / totalPertemuan) * 100;

            return {
                ...r,
                total_pertemuan: totalPertemuan,
                persentase: parseFloat(persentase.toFixed(2)),
                score: persentase
            };
        });

        final.sort((a, b) => b.score - a.score);

        return final.slice(0, limit);
    }

    /* -----------------------------------------------------
     * RIWAYAT SISWA
     * ----------------------------------------------------*/
    async riwayatSiswa({ student_id, start_date, end_date, semester_id }) {
        const where = { student_id };

        if (semester_id) where.semester_id = semester_id;

        if (start_date && end_date) {
            where.tanggal = { [Op.between]: [start_date, end_date] };
        }

        return Absensi.findAll({
            where,
            include: [
                { model: Mapel, as: "mapel" },
                { model: User, as: "validator" },
                { model: Semester, as: "semester" }
            ],
            order: [
                ["tanggal", "DESC"],
                ["jam_ke", "ASC"]
            ]
        });
    }

    /* -----------------------------------------------------
     * EXPORT CSV
     * ----------------------------------------------------*/
    async exportCsv(filter) {
        const data = await this.rekapHarian(filter);

        const parser = new Parser();
        return parser.parse(data.data);
    }

    /* -----------------------------------------------------
     * EXPORT PDF
     * ----------------------------------------------------*/
    async exportPdf(filter) {
        const data = await this.rekapHarian(filter);

        const doc = new PDFDocument();
        let buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {});

        doc.fontSize(18).text("Rekap Absensi", { align: "center" });
        doc.moveDown();

        data.data.forEach(d => {
            doc.fontSize(12).text(
                `${d.siswa.nama_lengkap} | ${d.tanggal} | ${d.status}`
            );
        });

        doc.end();

        return Buffer.concat(buffers);
    }
}

module.exports = new AbsensiService();