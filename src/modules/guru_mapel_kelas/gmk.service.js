// src/modules/guru_mapel_kelas/gmk.service.js
const GMK = require("./gmk.model");
const { Op } = require("sequelize");

class GMKService {
    async create(payload) {
        // unique composite check
        const exists = await GMK.findOne({
            where: {
                guru_id: payload.guru_id,
                kelas_id: payload.kelas_id,
                mapel_id: payload.mapel_id,
                tahun_ajaran: payload.tahun_ajaran
            }
        });
        if (exists) throw new Error("DUPLICATE_GMK");
        return GMK.create(payload);
    }

    async update(id, payload) {
        const row = await GMK.findByPk(id);
        if (!row) throw new Error("NOT_FOUND");
        // optionally check duplicates if key set changed
        await row.update(payload);
        return row;
    }

    async delete(id) {
        const row = await GMK.findByPk(id);
        if (!row) throw new Error("NOT_FOUND");
        await row.destroy();
        return true;
    }

    async getById(id) {
        return GMK.findByPk(id);
    }

    async list({ guru_id, kelas_id, mapel_id, page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;
        const where = {};
        if (guru_id) where.guru_id = guru_id;
        if (kelas_id) where.kelas_id = kelas_id;
        if (mapel_id) where.mapel_id = mapel_id;
        return GMK.findAndCountAll({
            where,
            offset,
            limit,
            order: [["created_at", "DESC"]]
        });
    }
}

module.exports = new GMKService();
