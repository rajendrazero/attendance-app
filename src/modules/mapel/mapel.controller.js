// src/modules/mapel/mapel.controller.js
const service = require("./mapel.service");
const { validate } = require("./mapel.validation");
const { fromSequelizeFindAndCount } = require("../../utils/pagination");

const create = async (req, res, next) => {
    try {
        const errors = validate(req.body);
        if (errors.length)
            return res.error("VALIDATION_ERROR", "VALIDATION_ERROR", 400, {
                details: errors
            });

        const row = await service.create(req.body);
        return res.success(row, "Mapel dibuat", 201);
    } catch (err) {
        if (err.message === "KODE_MAPEL_TAKEN")
            return res.error(
                "Kode mapel sudah dipakai",
                "KODE_MAPEL_TAKEN",
                400
            );
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const row = await service.update(req.params.id, req.body);
        return res.success(row, "Mapel diupdate");
    } catch (err) {
        if (err.message === "NOT_FOUND")
            return res.error("Mapel tidak ditemukan", "NOT_FOUND", 404);
        if (err.message === "KODE_MAPEL_TAKEN")
            return res.error(
                "Kode mapel sudah dipakai",
                "KODE_MAPEL_TAKEN",
                400
            );
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        await service.delete(req.params.id);
        return res.success(null, "Mapel dihapus");
    } catch (err) {
        if (err.message === "NOT_FOUND")
            return res.error("Mapel tidak ditemukan", "NOT_FOUND", 404);
        next(err);
    }
};

const get = async (req, res, next) => {
    try {
        const row = await service.getById(req.params.id);
        if (!row) return res.error("Mapel tidak ditemukan", "NOT_FOUND", 404);
        return res.success(row);
    } catch (err) {
        next(err);
    }
};

const list = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await service.list({ q: req.query.q, page, limit });
        return res.success(fromSequelizeFindAndCount(result, page, limit));
    } catch (err) {
        next(err);
    }
};

module.exports = { create, update, remove, get, list };
