/**
 * MASTER SCHEDULER — ENTERPRISE GRADE (AION FIXED)
 * ------------------------------------------------
 * Fitur:
 * 1. Auto Validate Absensi Lama
 * 2. Auto Reminder Siswa Alpha Tinggi
 * 3. Auto Clean Orphan Files (FIXED)
 * 4. Auto Archive Absensi Semester → CSV
 */

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
require("dotenv").config();

const sequelize = require("../config/db");

// Models
const Absensi = require("../modules/absensi/absensi.model");
const ValidationLog = require("../modules/validation_log/validationLog.model");
const ActivityLog = require("../modules/activity_log/activityLog.model");
const FileBukti = require("../modules/file_bukti/fileBukti.model");
const User = require("../modules/user/user.model");
const Semester = require("../modules/semester/semester.model");

const { Parser } = require("json2csv");

// ===== CONFIG =====
const SCHEDULER_CRON = process.env.SCHEDULER_CRON_DAILY || "0 5 * * *";
const AUTO_VALIDATE_AFTER_DAYS = parseInt(process.env.AUTO_VALIDATE_AFTER_DAYS || "3", 10);
const REMINDER_ALPHA_THRESHOLD = parseInt(process.env.REMINDER_ALPHA_THRESHOLD || "5", 10);
const REMINDER_PERIOD_DAYS = parseInt(process.env.REMINDER_PERIOD_DAYS || "30", 10);
const AUTO_DELETE_ORPHAN_DAYS = parseInt(process.env.AUTO_DELETE_ORPHAN_DAYS || "7", 10);
const EXPORT_DIR = process.env.AUTO_EXPORT_SEMESTER_DIR || "./exports/semester";

const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID
    ? parseInt(process.env.SYSTEM_USER_ID, 10)
    : null;

function logInfo(msg) {
    console.log(`[scheduler] ${new Date().toISOString()} - ${msg}`);
}

/* ============================================================================
   1) AUTO VALIDATE ABSENSI
============================================================================ */
async function autoValidateTask() {
    try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - AUTO_VALIDATE_AFTER_DAYS);

        const cutoffStr = cutoff.toISOString().slice(0, 10);

        const rows = await Absensi.findAll({
            where: {
                is_validated: false,
                tanggal: { [Op.lte]: cutoffStr }
            }
        });

        logInfo(`Auto-validate: ${rows.length} absensi sebelum ${cutoffStr}`);

        for (const a of rows) {
            a.is_validated = true;
            a.validated_at = new Date();
            a.validated_by = SYSTEM_USER_ID;
            await a.save();

            await ValidationLog.create({
                absensi_id: a.id,
                validator_id: SYSTEM_USER_ID,
                action: "auto_validate",
                timestamp: new Date()
            });
        }
    } catch (err) {
        console.error("autoValidateTask error:", err);
    }
}

/* ============================================================================
   2) AUTO REMINDER SISWA ALPHA TINGGI
============================================================================ */
async function autoReminderTask() {
    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - REMINDER_PERIOD_DAYS);

        const [rows] = await sequelize.query(
            `
            SELECT student_id, COUNT(*) as alpha_count
            FROM absensi
            WHERE tanggal BETWEEN :start AND :end
              AND status = 'tanpa_keterangan'
            GROUP BY student_id
            HAVING COUNT(*) >= :threshold
            `,
            {
                replacements: {
                    start: start.toISOString().slice(0, 10),
                    end: end.toISOString().slice(0, 10),
                    threshold: REMINDER_ALPHA_THRESHOLD
                }
            }
        );

        logInfo(`Auto-reminder: ${rows.length} siswa melebihi batas alpha`);

        for (const r of rows) {
            const user = await User.findByPk(r.student_id);
            if (!user) continue;

            await ActivityLog.create({
                user_id: SYSTEM_USER_ID,
                action: "reminder_alpha",
                description: `Siswa ${user.nama_lengkap} memiliki ${r.alpha_count} alpha`,
                resource: "user",
                resource_id: user.id
            });
        }
    } catch (err) {
        console.error("autoReminderTask error:", err);
    }
}

/* ============================================================================
   3) AUTO CLEAN ORPHAN FILES — FIXED
============================================================================ */
async function autoCleanOrphanFiles() {
    try {
        const uploadsDir = path.join(__dirname, "../../uploads/bukti");
        if (!fs.existsSync(uploadsDir)) return;

        const files = fs.readdirSync(uploadsDir);

        const deleteBefore = new Date();
        deleteBefore.setDate(deleteBefore.getDate() - AUTO_DELETE_ORPHAN_DAYS);

        for (const filename of files) {
            const fullPath = path.join(uploadsDir, filename);

            // skip directories
            if (!fs.statSync(fullPath).isFile()) continue;

            const fileRecord = await FileBukti.findOne({
                where: {
                    filename: filename, // <-- kolom valid, aman
                }
            });

            const fileStat = fs.statSync(fullPath);
            const isOld = fileStat.mtime < deleteBefore;

            // Jika file tidak ada di DB atau terlalu tua → hapus
            if (!fileRecord || isOld) {
                fs.unlinkSync(fullPath);
                logInfo(`Deleted orphan/expired file: ${filename}`);
            }
        }
    } catch (err) {
        console.error("autoCleanOrphanFiles error:", err);
    }
}

/* ============================================================================
   4) AUTO ARCHIVE SEMESTER → CSV
============================================================================ */
async function autoArchiveSemester() {
    try {
        const today = new Date().toISOString().slice(0, 10);

        const semester = await Semester.findOne({
            where: { end_date: today }
        });

        if (!semester) return;

        logInfo(`Archiving semester ${semester.semester} TA ${semester.tahun_ajaran}`);

        const data = await Absensi.findAll({
            where: { semester_id: semester.id },
            include: [{ model: User, as: "siswa" }]
        });

        const parser = new Parser();
        const csv = parser.parse(
            data.map(a => ({
                id: a.id,
                student_id: a.student_id,
                nama_siswa: a.siswa?.nama_lengkap || "-",
                tanggal: a.tanggal,
                jam_ke: a.jam_ke,
                status: a.status,
                semester_id: a.semester_id
            }))
        );

        const exportDir = path.join(__dirname, "../../", EXPORT_DIR);
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

        const filename = `${semester.tahun_ajaran.replace("/", "-")}_S${semester.semester}.csv`;
        const filePath = path.join(exportDir, filename);
        fs.writeFileSync(filePath, csv);

        logInfo(`✓ Semester archived → ${filename}`);
    } catch (err) {
        console.error("autoArchiveSemester error:", err);
    }
}

/* ============================================================================
   5) START SCHEDULER
============================================================================ */
function start() {
    logInfo(`Scheduler started. Cron: ${SCHEDULER_CRON}`);

    // Run immediately on startup
    autoValidateTask();
    autoReminderTask();
    autoCleanOrphanFiles();
    autoArchiveSemester();

    // Cron runtime
    cron.schedule(SCHEDULER_CRON, async () => {
        logInfo("Cron triggered...");
        await autoValidateTask();
        await autoReminderTask();
        await autoCleanOrphanFiles();
        await autoArchiveSemester();
    });
}

module.exports = {
    start,
    autoValidateTask,
    autoReminderTask,
    autoCleanOrphanFiles,
    autoArchiveSemester
};