// 1. Library eksternal
const { Op } = require("sequelize");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

// 2. Utils / helper
const { fromSequelizeFindAndCount } = require("../../utils/pagination");
const { isValidJam, deleteUploadedFile } = require("./absensi.helper");

// 3. Validasi
const { validateInputAbsensi } = require("./absensi.validation");

// 4. Models
const Absensi = require("./absensi.model");
const User = require("../user/user.model");
const Mapel = require("../mapel/mapel.model");
const GuruMapelKelas = require("../guru_mapel_kelas/gmk.model");
const FileBukti = require("../file_bukti/fileBukti.model");
const ValidationLog = require("../validation_log/validationLog.model");
const ActivityLog = require("../activity_log/activityLog.model");
const Kelas = require("../kelas/kelas.model");
const Jurusan = require("../jurusan/jurusan.model");
const Semester = require("../semester/semester.model");

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

            let { student_id, tanggal, status, keterangan, created_by, file } =
                data;

            const siswa = await User.findByPk(student_id);
            if (!siswa) {
                const err = new Error("SISWA_TIDAK_DITEMUKAN");
                err.status = 404;
                throw err;
            }

            // pastikan student_id merujuk ke user dengan role perangkat_kelas atau siswa
            if (!["perangkat_kelas", "siswa"].includes(siswa.role)) {
                const err = new Error("STUDENT_ROLE_INVALID");
                err.status = 400;
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

            let {
                student_id,
                tanggal,
                jam_ke,
                status,
                keterangan,
                created_by,
                file
            } = data;

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

            // pastikan student_id merujuk ke user dengan role perangkat_kelas atau siswa
            if (!["perangkat_kelas", "siswa"].includes(siswa.role)) {
                const err = new Error("STUDENT_ROLE_INVALID");
                err.status = 400;
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
    async getValidationQueue(guruId = null, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        // Jika tidak diberikan guruId, kembalikan semua absensi yang belum divalidasi (paginated)
        if (!guruId) {
            const result = await Absensi.findAndCountAll({
                where: { is_validated: false },
                include: [
                    { model: User, as: "siswa" },
                    { model: Mapel, as: "mapel" }
                ],
                order: [["tanggal", "DESC"]],
                offset,
                limit
            });

            return fromSequelizeFindAndCount(result, page, limit);
        }

        // jika guruId diberikan dan user adalah super_admin, kembalikan semua (paginated)
        const caller = await User.findByPk(guruId);
        if (caller && caller.role === "super_admin") {
            const result = await Absensi.findAndCountAll({
                where: { is_validated: false },
                include: [
                    { model: User, as: "siswa" },
                    { model: Mapel, as: "mapel" }
                ],
                order: [["tanggal", "DESC"]],
                offset,
                limit
            });

            return fromSequelizeFindAndCount(result, page, limit);
        }

        // Ambil relasi GMK untuk guru agar kita tahu mapel/kelas yang dia ampu
        const relasi = await GuruMapelKelas.findAll({
            where: { guru_id: guruId }
        });
        if (!relasi || relasi.length === 0)
            return fromSequelizeFindAndCount(
                { rows: [], count: 0 },
                page,
                limit
            );

        const mapelIds = [
            ...new Set(relasi.map(r => r.mapel_id).filter(Boolean))
        ];
        const kelasIds = [
            ...new Set(relasi.map(r => r.kelas_id).filter(Boolean))
        ];

        const where = { is_validated: false };
        const ors = [];

        if (mapelIds.length) {
            ors.push({ mapel_id: { [Op.in]: mapelIds } });
        }

        // Untuk absensi harian (jam_ke = null), validasi bisa berdasarkan kelas siswa
        if (kelasIds.length) {
            ors.push({
                jam_ke: null,
                ["$siswa.kelas_id$"]: { [Op.in]: kelasIds }
            });
        }

        if (ors.length) where[Op.or] = ors;

        const result = await Absensi.findAndCountAll({
            where,
            include: [
                { model: User, as: "siswa" },
                { model: Mapel, as: "mapel" }
            ],
            order: [["tanggal", "DESC"]],
            offset,
            limit
        });

        return fromSequelizeFindAndCount(result, page, limit);
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

        //co-pilot {Perbaikan: sesuaikan pembuatan ValidationLog dengan skema tabel validation_log
        // menyimpan status sebelum dan sesudah beserta action dan timestamp}
        const statusSebelum = absensi.status;

        absensi.validated_by = guruId;
        absensi.validated_at = new Date();
        absensi.is_validated = true;
        await absensi.save();

        await ValidationLog.create({
            absensi_id,
            validator_id: guruId,
            status_sebelum: statusSebelum,
            status_sesudah: status_validasi || absensi.status,
            action: "validate",
            timestamp: new Date()
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
    async rekapHarian({
        start_date,
        end_date,
        kelas_id,
        jurusan_id,
        semester_id,
        page = 1,
        limit = 20
    }) {
        // CASTING WAJIB
        page = Number(page) || 1;
        limit = Number(limit) || 20;
        kelas_id = kelas_id ? Number(kelas_id) : null;
        jurusan_id = jurusan_id ? Number(jurusan_id) : null;
        semester_id = semester_id ? Number(semester_id) : null;

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
    async rekapBulanan({
        periode,
        kelas_id,
        semester_id,
        page = 1,
        limit = 20
    }) {
        if (!periode) throw new Error("PERIODE_REQUIRED");

        const [year, month] = periode.split("-");
        // hitung hari terakhir bulan secara dinamis
        const start = `${year}-${month}-01`;
        const lastDay = new Date(
            parseInt(year, 10),
            parseInt(month, 10),
            0
        ).getDate();
        const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

        const offset = (page - 1) * limit;

        const result = await Absensi.findAndCountAll({
            where: {
                tanggal: { [Op.between]: [start, end] },
                ...(semester_id && { semester_id }),
                ...(kelas_id && { "$siswa.kelas_id$": kelas_id })
            },
            include: [
                {
                    model: User,
                    as: "siswa",
                    include: [{ model: Kelas, as: "kelas" }]
                },
                { model: Mapel, as: "mapel" },
                { model: Semester, as: "semester" }
            ],
            offset,
            limit,
            order: [["tanggal", "DESC"]]
        });

        return fromSequelizeFindAndCount(result, page, limit);
    }

    /* -----------------------------------------------------
     * REKAP PER KELAS
     * ----------------------------------------------------*/
    async rekapKelas({ kelas_id, periode, semester_id, page = 1, limit = 20 }) {
        if (!kelas_id) throw new Error("KELAS_ID_REQUIRED");
        if (!periode) throw new Error("PERIODE_REQUIRED");

        const [year, month] = periode.split("-");
        const start = `${year}-${month}-01`;
        const lastDay = new Date(
            parseInt(year, 10),
            parseInt(month, 10),
            0
        ).getDate();
        const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

        const offset = (page - 1) * limit;

        const result = await Absensi.findAndCountAll({
            where: {
                "$siswa.kelas_id$": kelas_id,
                tanggal: { [Op.between]: [start, end] },
                ...(semester_id && { semester_id })
            },
            include: [
                { model: User, as: "siswa" },
                { model: Mapel, as: "mapel" },
                { model: Semester, as: "semester" }
            ],
            offset,
            limit,
            order: [["tanggal", "DESC"]]
        });

        return fromSequelizeFindAndCount(result, page, limit);
    }

    /* -----------------------------------------------------
     * RANKING SISWA
     * ----------------------------------------------------*/
    async rankingSiswa({
        kelas_id,
        periode = null,
        semester_id = null,
        page = 1,
        limit = 10
    }) {
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
            const persentase =
                totalPertemuan === 0 ? 0 : (r.hadir / totalPertemuan) * 100;

            return {
                ...r,
                total_pertemuan: totalPertemuan,
                persentase: parseFloat(persentase.toFixed(2)),
                score: persentase
            };
        });

        final.sort((a, b) => b.score - a.score);

        const total = final.length;
        const offset = (page - 1) * limit;
        const pageRows = final.slice(offset, offset + limit);

        const { buildPaginatedResponse } = require("../../utils/pagination");
        return buildPaginatedResponse(pageRows, total, page, limit);
    }

    /* -----------------------------------------------------
     * RIWAYAT SISWA
     * ----------------------------------------------------*/
    async riwayatSiswa({
        student_id,
        start_date,
        end_date,
        semester_id,
        page = 1,
        limit = 20
    }) {
        const where = { student_id };

        if (semester_id) where.semester_id = semester_id;

        if (start_date && end_date) {
            where.tanggal = { [Op.between]: [start_date, end_date] };
        }

        const offset = (page - 1) * limit;

        const result = await Absensi.findAndCountAll({
            where,
            include: [
                { model: Mapel, as: "mapel" },
                { model: User, as: "validator" },
                { model: Semester, as: "semester" }
            ],
            order: [
                ["tanggal", "DESC"],
                ["jam_ke", "ASC"]
            ],
            offset,
            limit
        });

        return fromSequelizeFindAndCount(result, page, limit);
    }
    
    /* -----------------------------------------------------
 * AMBIL ABSENSI BY STUDENT ID
 * ----------------------------------------------------*/
async ambilAbsensiByStudentId({
    student_id,
    periode = null,
    semester_id = null,
    page = 1,
    limit = 20
}) {
    if (!student_id) {
        const err = new Error("STUDENT_ID_REQUIRED");
        err.status = 400;
        throw err;
    }

    const where = { student_id };

    // Jika periode = "YYYY-MM"
    if (periode) {
        const [yearStr, monthStr] = periode.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);

        if (
            Number.isNaN(year) ||
            Number.isNaN(month) ||
            month < 1 ||
            month > 12
        ) {
            const err = new Error("INVALID_PERIODE_FORMAT");
            err.status = 400;
            throw err;
        }

        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
            lastDay
        ).padStart(2, "0")}`;

        where.tanggal = { [Op.between]: [startDate, endDate] };
    }

    if (semester_id) {
        where.semester_id = semester_id;
    }

    const offset = (page - 1) * limit;

    // Data paginated utama
    const result = await Absensi.findAndCountAll({
        where,
        include: [
            { model: Mapel, as: "mapel" },
            { model: User, as: "validator" },
            { model: Semester, as: "semester" }
        ],
        order: [
            ["tanggal", "DESC"],
            ["jam_ke", "ASC"]
        ],
        offset,
        limit
    });

    // Summary all (hadir / sakit / izin / alpha)
    const summaryRaw = await Absensi.findAll({
        where,
        attributes: [
            "status",
            [Absensi.sequelize.fn("COUNT", Absensi.sequelize.col("status")), "count"]
        ],
        group: ["status"]
    });

    const summary = { hadir: 0, sakit: 0, izin: 0, tanpa_keterangan: 0, total: 0 };

    summaryRaw.forEach(r => {
        const status = r.get("status");
        const count = Number(r.get("count"));
        summary[status] = count;
        summary.total += count;
    });

    const paginated = fromSequelizeFindAndCount(result, page, limit);

    return {
        ...paginated,
        summary
    };
}

    /* -----------------------------------------------------
     * EXPORT CSV
     * ----------------------------------------------------*/
    async exportCsv(filter) {
        // Export the (possibly large) rekap data to CSV.
        // Ensure we convert Sequelize instances to plain objects to avoid circular references.
        const page = parseInt(filter.page) || 1;
        // if no explicit limit provided, request a very large page size to include all rows
        const limit = parseInt(filter.limit) || 1000000;

        const paginated = await this.rekapHarian({ ...filter, page, limit });
        const rows =
            paginated && paginated.data
                ? paginated.data.map(r => {
                      if (r && typeof r.toJSON === "function")
                          return r.toJSON();
                      return r;
                  })
                : [];

        const parser = new Parser();
        return parser.parse(rows);
    }

    /* -----------------------------------------------------
     * EXPORT PDF
     * ----------------------------------------------------*/
    async exportPdf(filter) {
        const data = await this.rekapHarian(filter);

        const doc = new PDFDocument();
        //co-pilot {Perbaikan: exportPdf sekarang mengembalikan Promise yang menunggu event 'end' agar buffer PDF lengkap}
        return new Promise((resolve, reject) => {
            const buffers = [];

            doc.on("data", chunk => buffers.push(chunk));
            doc.on("end", () => {
                try {
                    resolve(Buffer.concat(buffers));
                } catch (e) {
                    reject(e);
                }
            });
            doc.on("error", reject);

            doc.fontSize(18).text("Rekap Absensi", { align: "center" });
            doc.moveDown();

            data.data.forEach(d => {
                doc.fontSize(12).text(
                    `${d.siswa.nama_lengkap} | ${d.tanggal} | ${d.status}`
                );
            });

            doc.end();
        });
    }
}

module.exports = new AbsensiService();
