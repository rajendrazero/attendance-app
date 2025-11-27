// src/modules/admin/dashboard.service.js
const { Op, fn, col, literal } = require("sequelize");
const User = require("../user/user.model");
const Absensi = require("../absensi/absensi.model");
const Kelas = require("../kelas/kelas.model");
const ActivityLog = require("../activity_log/activityLog.model");

class DashboardService {
  async getDashboardStats({ date = null }) {
    const today = date || new Date().toISOString().slice(0, 10);

    // ======================
    // SUMMARY UTAMA
    // ======================
    const totalSiswa = await User.count({ where: { role: "siswa" } });

    const totalGuru = await User.count({
      where: { role: { [Op.in]: ["guru_mapel", "wali_kelas", "perangkat_kelas"] } }
    });

    const totalKelas = await Kelas.count();

    // ======================
    // KEHADIRAN HARI INI
    // ======================
    const hadirToday = await Absensi.count({ where: { tanggal: today, status: "hadir" } });

    const totalToday = await Absensi.count({ where: { tanggal: today } });

    const kehadiranHariIni =
      totalSiswa === 0 ? 0 : (hadirToday / totalSiswa) * 100;

    // ======================
    // RATA-RATA HADIR 30 HARI
    // ======================
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);

    const dateStart = thirtyAgo.toISOString().slice(0, 10);

    const totalHadir30 = await Absensi.count({
      where: {
        status: "hadir",
        tanggal: { [Op.between]: [dateStart, today] }
      }
    });

    const rataRataBulanan =
      totalSiswa === 0 ? 0 : (totalHadir30 / (totalSiswa * 30)) * 100;

    // ======================
    // TOP KELAS (30 HARI)
    // ======================
    const topKelas = await Absensi.findAll({
      attributes: [
        [literal("siswa.kelas_id"), "kelas_id"],
        [
          literal("SUM(CASE WHEN status='hadir' THEN 1 ELSE 0 END)"),
          "hadir_count"
        ],
        [literal("COUNT(*)"), "total_count"],
        [
          literal(
            "(SUM(CASE WHEN status='hadir' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0)) * 100"
          ),
          "persentase"
        ]
      ],
      include: [
        {
          model: User,
          as: "siswa",
          attributes: []
        }
      ],
      where: {
        tanggal: { [Op.between]: [dateStart, today] }
      },
      group: ["siswa.kelas_id"],
      order: [literal("persentase DESC")],
      limit: 5,
      raw: true
    });

    // Map nama kelas
    const kelasIds = topKelas.map((k) => k.kelas_id).filter(Boolean);
    const kelasMap = {};
    if (kelasIds.length) {
      const kelasRows = await Kelas.findAll({ where: { id: kelasIds } });
      kelasRows.forEach((k) => (kelasMap[k.id] = k.nama_kelas));
    }

    const topPerformers = topKelas.map((k) => ({
      kelas_id: k.kelas_id,
      nama_kelas: kelasMap[k.kelas_id] || null,
      hadir_count: Number(k.hadir_count),
      total_count: Number(k.total_count),
      persentase: Number(k.persentase.toFixed(2))
    }));

    // ======================
    // STUDENTS WITH HIGH ALPHA
    // ======================
    const problematicThreshold = 5;

    const alphaRows = await Absensi.findAll({
      attributes: [
        "student_id",
        [
          literal(
            "SUM(CASE WHEN status='tanpa_keterangan' THEN 1 ELSE 0 END)"
          ),
          "alpha_count"
        ]
      ],
      where: {
        tanggal: { [Op.between]: [dateStart, today] }
      },
      group: ["student_id"],
      having: literal(
        `SUM(CASE WHEN status='tanpa_keterangan' THEN 1 ELSE 0 END) >= ${problematicThreshold}`
      ),
      raw: true
    });

    const problematicStudents = [];
    if (alphaRows.length) {
      const studentIds = alphaRows.map((r) => r.student_id);
      const users = await User.findAll({
        where: { id: studentIds },
        attributes: ["id", "nama_lengkap", "nisn", "kelas_id"]
      });

      const userMap = {};
      users.forEach((u) => (userMap[u.id] = u));

      alphaRows.forEach((r) => {
        const u = userMap[r.student_id];
        problematicStudents.push({
          id: r.student_id,
          nama: u ? u.nama_lengkap : null,
          nisn: u ? u.nisn : null,
          kelas_id: u ? u.kelas_id : null,
          total_alpha: Number(r.alpha_count)
        });
      });
    }

    // ======================
    // RECENT ACTIVITY LOG
    // ======================
    const recentActivities = await ActivityLog.findAll({
      limit: 10,
      order: [["timestamp", "DESC"]],
      raw: true
    });

    // ======================
    // RESPONSE
    // ======================
    return {
      total_siswa: totalSiswa,
      total_guru: totalGuru,
      total_kelas: totalKelas,
      kehadiran_hari_ini: Number(kehadiranHariIni.toFixed(2)),
      rata_rata_bulanan: Number(rataRataBulanan.toFixed(2)),
      top_performers: topPerformers,
      problematic_students: problematicStudents,
      recent_activities: recentActivities
    };
  }
}

module.exports = new DashboardService();