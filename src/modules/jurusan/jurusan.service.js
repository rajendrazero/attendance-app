// src/modules/jurusan/jurusan.service.js
const Jurusan = require("./jurusan.model");
const { Op } = require("sequelize");

class JurusanService {
  async create(payload) {
    // unique check
    const exists = await Jurusan.findOne({ where: { kode_jurusan: payload.kode_jurusan } });
    if (exists) throw new Error("KODE_JURUSAN_TAKEN");
    return Jurusan.create(payload);
  }

  async update(id, payload) {
    const jur = await Jurusan.findByPk(id);
    if (!jur) throw new Error("NOT_FOUND");
    if (payload.kode_jurusan && payload.kode_jurusan !== jur.kode_jurusan) {
      const dup = await Jurusan.findOne({ where: { kode_jurusan: payload.kode_jurusan, id: { [Op.ne]: id } } });
      if (dup) throw new Error("KODE_JURUSAN_TAKEN");
    }
    await jur.update(payload);
    return jur;
  }

  async delete(id) {
    const jur = await Jurusan.findByPk(id);
    if (!jur) throw new Error("NOT_FOUND");
    await jur.destroy();
    return true;
  }

  async getById(id) {
    return Jurusan.findByPk(id);
  }

  async list({ q, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const where = {};
    if (q) where.nama_jurusan = { [Op.iLike]: `%${q}%` };
    const result = await Jurusan.findAndCountAll({ where, limit, offset, order: [["nama_jurusan","ASC"]] });
    return result;
  }
}

module.exports = new JurusanService();