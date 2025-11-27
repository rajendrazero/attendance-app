// src/modules/jurusan/jurusan.controller.js
const service = require("./jurusan.service");
const { validateCreate, validateUpdate } = require("./jurusan.validation");
const { fromSequelizeFindAndCount } = require("../../utils/pagination");

const create = async (req, res, next) => {
  try {
    const errors = validateCreate(req.body);
    if (errors.length) return res.error("Validation failed", "VALIDATION_ERROR", 400, { details: errors });

    const row = await service.create(req.body);
    return res.success(row, "Jurusan berhasil dibuat", 201);
  } catch (err) {
    if (err.message === "KODE_JURUSAN_TAKEN") return res.error("Kode jurusan sudah dipakai", "KODE_JURUSAN_TAKEN", 400);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const errors = validateUpdate(req.body);
    if (errors.length) return res.error("Validation failed", "VALIDATION_ERROR", 400, { details: errors });

    const row = await service.update(id, req.body);
    return res.success(row, "Jurusan berhasil diupdate");
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.error("Jurusan tidak ditemukan", "NOT_FOUND", 404);
    if (err.message === "KODE_JURUSAN_TAKEN") return res.error("Kode jurusan sudah dipakai", "KODE_JURUSAN_TAKEN", 400);
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    await service.delete(id);
    return res.success(null, "Jurusan berhasil dihapus");
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.error("Jurusan tidak ditemukan", "NOT_FOUND", 404);
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const id = req.params.id;
    const row = await service.getById(id);
    if (!row) return res.error("Jurusan tidak ditemukan", "NOT_FOUND", 404);
    return res.success(row);
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const q = req.query.q || null;
    const result = await service.list({ q, page, limit });
    return res.success(fromSequelizeFindAndCount(result, page, limit));
  } catch (err) { next(err); }
};

module.exports = { create, update, remove, get, list };