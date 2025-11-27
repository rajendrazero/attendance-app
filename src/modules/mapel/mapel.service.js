// src/modules/mapel/mapel.service.js
const Mapel = require("./mapel.model");
const { Op } = require("sequelize");

class MapelService {
  async create(payload) {
    const exists = await Mapel.findOne({ where: { kode_mapel: payload.kode_mapel } });
    if (exists) throw new Error("KODE_MAPEL_TAKEN");
    return Mapel.create(payload);
  }

  async update(id, payload) {
    const row = await Mapel.findByPk(id);
    if (!row) throw new Error("NOT_FOUND");
    if (payload.kode_mapel && payload.kode_mapel !== row.kode_mapel) {
      const dup = await Mapel.findOne({ where: { kode_mapel: payload.kode_mapel, id: { [Op.ne]: id } } });
      if (dup) throw new Error("KODE_MAPEL_TAKEN");
    }
    await row.update(payload);
    return row;
  }

  async delete(id) {
    const row = await Mapel.findByPk(id);
    if (!row) throw new Error("NOT_FOUND");
    await row.destroy();
    return true;
  }

  async getById(id) { return Mapel.findByPk(id); }

  async list({ q, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const where = {};
    //co-pilot {Perbaikan: ganti Op.iLike (Postgres-specific) menjadi Op.like agar kompatibel dengan MySQL/MariaDB}
    if (q) where.nama_mapel = { [Op.like]: `%${q}%` };
    return Mapel.findAndCountAll({ where, offset, limit, order: [["nama_mapel","ASC"]] });
  }
}

module.exports = new MapelService();