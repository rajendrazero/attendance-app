const User = require("../modules/user/user.model");
const Jurusan = require("../modules/jurusan/jurusan.model");
const Kelas = require("../modules/kelas/kelas.model");
const Mapel = require("../modules/mapel/mapel.model");
const GuruMapelKelas = require("../modules/guru_mapel_kelas/gmk.model");
const Absensi = require("../modules/absensi/absensi.model");
const ValidationLog = require("../modules/validation_log/validationLog.model");
const ActivityLog = require("../modules/activity_log/activityLog.model");
const FileBukti = require("../modules/file_bukti/fileBukti.model");
const RefreshToken = require("../modules/auth/refreshToken.model");
const Semester = require("../modules/semester/semester.model");

Semester.hasMany(Absensi, { foreignKey: "semester_id" });
Absensi.belongsTo(Semester, { foreignKey: "semester_id" });
module.exports = () => {
    /*
     * =====================
     *  RefreshToken←→User
     * =====================
     */
    RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });
    User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refresh_tokens" });
    /*
     * =====================
     *  USER ←→ JURUSAN
     * =====================
     */

    // User belongs to Jurusan
    User.belongsTo(Jurusan, {
        foreignKey: "jurusan_id",
        as: "jurusan"
    });

    Jurusan.hasMany(User, {
        foreignKey: "jurusan_id",
        as: "users"
    });

    /*
     * =====================
     *  USER ←→ KELAS
     * =====================
     */

    User.belongsTo(Kelas, {
        foreignKey: "kelas_id",
        as: "kelas"
    });

    Kelas.hasMany(User, {
        foreignKey: "kelas_id",
        as: "siswa"
    });

    /*
     * =============================
     *  KELAS.wali_kelas → USER
     * =============================
     */

    Kelas.belongsTo(User, {
        foreignKey: "wali_kelas_id",
        as: "wali_kelas"
    });

    User.hasOne(Kelas, {
        foreignKey: "wali_kelas_id",
        as: "kelas_yang_diampu"
    });

    /*
     * =====================
     *  MAPEL
     * =====================
     */

    // no relasi khusus di mapel kecuali GMK & Absensi

    /*
     * ==================================
     *  GURU_MAPEL_KELAS (GMK)
     *  (many-to-many-with-extra-fields)
     * ==================================
     */

    GuruMapelKelas.belongsTo(User, {
        foreignKey: "guru_id",
        as: "guru"
    });
    User.hasMany(GuruMapelKelas, {
        foreignKey: "guru_id",
        as: "mengajar"
    });

    GuruMapelKelas.belongsTo(Kelas, {
        foreignKey: "kelas_id",
        as: "kelas"
    });
    Kelas.hasMany(GuruMapelKelas, {
        foreignKey: "kelas_id",
        as: "kelas_mapel"
    });

    GuruMapelKelas.belongsTo(Mapel, {
        foreignKey: "mapel_id",
        as: "mapel"
    });
    Mapel.hasMany(GuruMapelKelas, {
        foreignKey: "mapel_id",
        as: "pengampu_mapel"
    });

    /*
     * =====================
     *  ABSENSI
     * =====================
     */

    // student yang diabsen
    Absensi.belongsTo(User, {
        foreignKey: "student_id",
        as: "siswa"
    });
    User.hasMany(Absensi, {
        foreignKey: "student_id",
        as: "riwayat_absensi"
    });

    // who created the record (perangkat kelas / wali kelas)
    Absensi.belongsTo(User, {
        foreignKey: "created_by",
        as: "input_by"
    });

    // guru mapel validator
    Absensi.belongsTo(User, {
        foreignKey: "validated_by",
        as: "validator"
    });

    // mapel untuk absensi per-jam
    Absensi.belongsTo(Mapel, {
        foreignKey: "mapel_id",
        as: "mapel"
    });
    
    Semester.hasMany(Absensi, { foreignKey: "semester_id" });
Absensi.belongsTo(Semester, { foreignKey: "semester_id" });

    /*
     * =========================
     *  VALIDATION LOG
     * =========================
     */

    ValidationLog.belongsTo(Absensi, {
        foreignKey: "absensi_id",
        as: "absensi"
    });

    Absensi.hasMany(ValidationLog, {
        foreignKey: "absensi_id",
        as: "validasi_log"
    });

    ValidationLog.belongsTo(User, {
        foreignKey: "validator_id",
        as: "validator"
    });

    /*
     * =========================
     *  ACTIVITY LOG
     * =========================
     */

    ActivityLog.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    User.hasMany(ActivityLog, {
        foreignKey: "user_id",
        as: "aktivitas"
    });

    /*
     * =========================
     *  FILE BUKTI
     * =========================
     */

    FileBukti.belongsTo(User, {
        foreignKey: "uploaded_by",
        as: "uploader"
    });

    FileBukti.belongsTo(Absensi, {
        foreignKey: "absensi_id",
        as: "absensi"
    });

    Absensi.hasMany(FileBukti, {
        foreignKey: "absensi_id",
        as: "file_bukti"
    });

    console.log("All associations successfully loaded.");
};
