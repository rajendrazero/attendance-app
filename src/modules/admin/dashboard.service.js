// src/modules/admin/dashboard.service.js
const { Op, fn, col, literal } = require("sequelize");
const User = require("../user/user.model");
const Absensi = require("../absensi/absensi.model");
const Kelas = require("../kelas/kelas.model");
const Jurusan = require("../jurusan/jurusan.model");
const ActivityLog = require("../activity_log/activityLog.model");
const { fromSequelizeFindAndCount } = require("../../utils/pagination");

class DashboardService {
  /**
   * Summary counts and today attendance
   */
  async getDashboardStats({ date = null }) {
    const today = date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // totals
    const totalSiswa = await User.count({ where: { role: "siswa" } });
    const totalGuru = await User.count({
      where: { role: { [Op.in]: ["guru_mapel", "wali_kelas", "perangkat_kelas"] } }
    });
    const totalKelas = await Kelas.count();

    // kehadiran hari ini (persentase hadir dari total siswa)
    const hadirToday = await Absensi.count({
      where: { tanggal: today, status: "hadir" }
    });

    const totalToday = await Absensi.count({ where: { tanggal: today } });

    const kehadiranHariIni = totalToday === 0 ? 0 : (hadirToday / totalSiswa) * 100;

    // rata-rata bulanan: per siswa rata-rata hadir dalam 30 hari terakhir
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const totalHadir30 = await Absensi.count({
      where: { status: "hadir", tanggal: { [Op.between]: [thirtyAgo.toISOString().slice(0,10), today] } }
    });

    const rataRataBulanan = totalSiswa === 0 ? 0 : (totalHadir30 / (totalSiswa * 30)) * 100;

    // top performers (kelas) — rata-rata kehadiran per kelas (30 hari)
    const topKelas = await Absensi.findAll({
      attributes: [
        [literal("siswa.kelas_id"), "kelas_id"],
        [fn("COUNT", literal(`CASE WHEN status='hadir' THEN 1 END`)), "hadir_count"],
        [fn("COUNT", col("Absensi.id")), "total_count"]
      ],
      include: [{ model: User, as: "siswa", attributes: [] }],
      where: { tanggal: { [Op.between]: [thirtyAgo.toISOString().slice(0,10), today] } },
      group: ["siswa.kelas_id"],
      order: [[literal("hadir_count / NULLIF(total_count,0)"), "DESC"]],
      limit: 5,
      raw: true
    });

    // map kelas names
    const kelasIds = topKelas.map(k => k.kelas_id).filter(Boolean);
    const kelasMap = {};
    if (kelasIds.length) {
      const kelasRows = await Kelas.findAll({ where: { id: kelasIds } });
      kelasRows.forEach(k => (kelasMap[k.id] = k.nama_kelas));
    }

    const topPerformers = topKelas.map(k => ({
      kelas_id: k.kelas_id,
      nama_kelas: kelasMap[k.kelas_id] || null,
      hadir_count: parseInt(k.hadir_count, 10),
      total_count: parseInt(k.total_count, 10),
      persentase: k.total_count ? +( (k.hadir_count / k.total_count) * 100 ).toFixed(2) : 0
    }));

    // problematic students: siswa dengan alpha >= threshold (configurable later)
    // default threshold 5 in 30 days
    const problematicThreshold = 5;
    const alphaRows = await Absensi.findAll({
      attributes: [
        "student_id",
        [fn("COUNT", literal(`CASE WHEN status='tanpa_keterangan' THEN 1 END`)), "alpha_count"]
      ],
      where: { tanggal: { [Op.between]: [thirtyAgo.toISOString().slice(0,10), today] } },
      group: ["student_id"],
      having: literal(`COUNT(CASE WHEN status='tanpa_keterangan' THEN 1 END) >= ${problematicThreshold}`),
      raw: true
    });

    const problematicStudents = [];
    if (alphaRows.length) {
      const studentIds = alphaRows.map(r => r.student_id);
      const users = await User.findAll({ where: { id: studentIds }, attributes: ["id", "nama_lengkap", "nisn", "kelas_id"] });
      const userMap = {};
      users.forEach(u => (userMap[u.id] = u));

      alphaRows.forEach(r => {
        const u = userMap[r.student_id];
        problematicStudents.push({
          id: r.student_id,
          nama: u ? u.nama_lengkap : null,
          nisn: u ? u.nisn : null,
          kelas_id: u ? u.kelas_id : null,
          total_alpha: parseInt(r.alpha_count, 10)
        });
      });
    }

    // recent activities (limit 10)
    const recentActivities = await ActivityLog.findAll({
      limit: 10,
      order: [["timestamp", "DESC"]],
      raw: true
    });

    return {
      total_siswa: totalSiswa,
      total_guru: totalGuru,
      total_kelas: totalKelas,
      kehadiran_hari_ini: +kehadiranHariIni.toFixed(2),
      rata_rata_bulanan: +rataRataBulanan.toFixed(2),
      top_performers: topPerformers,
      problematic_students: problematicStudents,
      recent_activities: recentActivities
    };
  }
}

module.exports = new DashboardService();