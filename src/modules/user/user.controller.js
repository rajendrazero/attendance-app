// src/modules/user/user.controller.js

const userService = require("./user.service");

class UserController {
    async create(req, res, next) {
        try {
            const result = await userService.create(req.body, req.user.id);
            return res.success(result, "User berhasil dibuat", 201);
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            const result = await userService.update(
                parseInt(id),
                req.body,
                req.user // kirim actor lengkap
            );

            return res.success(result, "User updated");
        } catch (err) {
            next(err);
        }
    }


    async remove(req, res, next) {
        try {
            await userService.remove(req.params.id, req.user.id);
            return res.success(null, "User berhasil dihapus");
        } catch (err) {
            next(err);
        }
    }

    async get(req, res, next) {
        try {
            const result = await userService.get(req.params.id);
            return res.success(result, "Detail user");
        } catch (err) {
            next(err);
        }
    }

    async list(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await userService.list({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20
            });

            return res.success(result.data, "List user", {
                pagination: result.meta
            });
        } catch (err) {
            next(err);
        }
    }
    
    async importCsv(req, res, next) {
    try {
        const result = await userService.importCsv(req.file, req.user.id);
        return res.success(result, "Import CSV selesai");
    } catch (err) {
        next(err);
    }
}

async exportCsv(req, res, next) {
    try {
        const csvBuffer = await userService.exportCsv();

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=users.csv");

        return res.send(csvBuffer);
    } catch (err) {
        next(err);
    }
}
}

module.exports = new UserController();
