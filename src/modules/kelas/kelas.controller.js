// src/modules/kelas/kelas.controller.js
const service = require("./kelas.service");
const { validateCreate, validateUpdate } = require("./kelas.validation");
const { fromSequelizeFindAndCount } = require("../../utils/pagination");

const create = async (req, res, next) => {
  try {
    const errors = validateCreate(req.body);
    if (errors.length) return res.error("VALIDATION_ERROR", "VALIDATION_ERROR", 400, { details: errors });

    const row = await service.create(req.body);
    return res.success(row, "Kelas dibuat", 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const errors = validateUpdate(req.body);
    if (errors.length) return res.error("VALIDATION_ERROR", "VALIDATION_ERROR", 400, { details: errors });

    const row = await service.update(id, req.body);
    return res.success(row, "Kelas diupdate");
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.error("Kelas tidak ditemukan", "NOT_FOUND", 404);
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.delete(req.params.id);
    return res.success(null, "Kelas dihapus");
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.error("Kelas tidak ditemukan", "NOT_FOUND", 404);
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const row = await service.getById(req.params.id);
    if (!row) return res.error("Kelas tidak ditemukan", "NOT_FOUND", 404);
    return res.success(row);
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await service.list({ q: req.query.q, jurusan_id: req.query.jurusan_id, page, limit });
    return res.success(fromSequelizeFindAndCount(result, page, limit));
  } catch (err) { next(err); }
};

module.exports = { create, update, remove, get, list };