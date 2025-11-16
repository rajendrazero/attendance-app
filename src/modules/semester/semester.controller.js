const service = require("./semester.service");

const list = async (req, res, next) => {
    try {
        const data = await service.getAll();
        return res.success(data, "Daftar semester");
    } catch (err) {
        next(err);
    }
};

const active = async (req, res, next) => {
    try {
        const data = await service.getActiveSemester();
        return res.success(data, "Semester aktif ditemukan");
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const data = await service.create(req.body);
        return res.success(data, "Semester berhasil dibuat");
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const data = await service.update(req.params.id, req.body);
        return res.success(data, "Semester berhasil diperbarui");
    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        await service.remove(req.params.id);
        return res.success(null, "Semester berhasil dihapus");
    } catch (err) {
        next(err);
    }
};

module.exports = { list, active, create, update, remove };
