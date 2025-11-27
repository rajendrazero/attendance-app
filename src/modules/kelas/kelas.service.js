// src/modules/kelas/kelas.service.js
const Kelas = require("./kelas.model");
const { Op } = require("sequelize");

class KelasService {
  async create(payload) {
    return Kelas.create(payload);
  }

  async update(id, payload) {
    const row = await Kelas.findByPk(id);
    if (!row) throw new Error("NOT_FOUND");
    await row.update(payload);
    return row;
  }

  async delete(id) {
    const row = await Kelas.findByPk(id);
    if (!row) throw new Error("NOT_FOUND");
    await row.destroy();
    return true;
  }

  async getById(id) {
    return Kelas.findByPk(id);
  }

  async list({ q, jurusan_id, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const where = {};
    //co-pilot {Perbaikan: ganti Op.iLike (Postgres) ke Op.like agar kompatibel dengan MySQL/MariaDB}
    if (q) where.nama_kelas = { [Op.like]: `%${q}%` };
    if (jurusan_id) where.jurusan_id = jurusan_id;
    return Kelas.findAndCountAll({ where, limit, offset, order: [["nama_kelas", "ASC"]] });
  }
}

module.exports = new KelasService();