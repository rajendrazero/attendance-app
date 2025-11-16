// src/modules/guru_mapel_kelas/gmk.controller.js
const service = require("./gmk.service");
const { validateCreate } = require("./gmk.validation");
const { fromSequelizeFindAndCount } = require("../../utils/pagination");

const create = async (req, res, next) => {
  try {
    const errors = validateCreate(req.body);
    if (errors.length) return res.error("VALIDATION_ERROR", "VALIDATION_ERROR", 400, { details: errors });

    const row = await service.create(req.body);
    return res.success(row, "Relasi GMK dibuat", 201);
  } catch (err) {
    if (err.message === "DUPLICATE_GMK") return res.error("Relasi sudah ada", "DUPLICATE_GMK", 400);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const row = await service.update(req.params.id, req.body);
    return res.success(row, "Relasi GMK diupdate");
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.error("Relasi tidak ditemukan", "NOT_FOUND", 404);
    next(err);
  }
};

const remove = async (req, res, next) => {
  try { await service.delete(req.params.id); return res.success(null, "Relasi GMK dihapus"); } catch (err) {
    if (err.message === "NOT_FOUND") return res.error("Relasi tidak ditemukan", "NOT_FOUND", 404);
    next(err);
  }
};

const get = async (req, res, next) => {
  try { const row = await service.getById(req.params.id); if (!row) return res.error("NOT_FOUND","NOT_FOUND",404); return res.success(row); } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await service.list({ guru_id: req.query.guru_id, kelas_id: req.query.kelas_id, mapel_id: req.query.mapel_id, page, limit });
    return res.success(fromSequelizeFindAndCount(result, page, limit));
  } catch (err) { next(err); }
};

module.exports = { create, update, remove, get, list };