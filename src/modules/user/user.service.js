// src/modules/user/user.service.js

const User = require("./user.model");
const bcrypt = require("bcryptjs");
const ActivityLog = require("../activity_log/activityLog.model");
const { fromSequelizeFindAndCount } = require("../../utils/pagination");
const { validateUser } = require("./user.validation");
const fs = require("fs");
const csvParser = require("csv-parser");
const { Parser } = require("json2csv");

class UserService {
    /* CREATE USER */
    async create(data, actorId) {
        const errors = validateUser(data);
        if (errors.length > 0) {
            const err = new Error("VALIDATION_ERROR");
            err.status = 400;
            err.details = errors;
            throw err;
        }

        // Cek unique
        const duplicate = await User.findOne({
            where: {
                username: data.username
            }
        });

        if (duplicate) {
            const err = new Error("USERNAME_TAKEN");
            err.status = 400;
            throw err;
        }

        const passwordHash = await bcrypt.hash(
            data.password || "password123",
            10
        );

        const newUser = await User.create({
            ...data,
            password: passwordHash,
            created_at: new Date(),
            updated_at: new Date()
        });

        await ActivityLog.create({
            user_id: actorId,
            action: "create_user",
            description: `User ${newUser.username} dibuat`,
            resource: "users",
            resource_id: newUser.id,
            timestamp: new Date()
        });

        return newUser;
    }

    /* UPDATE USER */
    async update(id, updateData, actorId) {
        const user = await User.findByPk(id);
        if (!user) {
            const err = new Error("USER_NOT_FOUND");
            err.status = 404;
            throw err;
        }

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        updateData.updated_at = new Date();

        await user.update(updateData);

        await ActivityLog.create({
            user_id: actorId,
            action: "update_user",
            description: `User ${user.username} diperbarui`,
            resource: "users",
            resource_id: id,
            timestamp: new Date()
        });

        return user;
    }

    /* DELETE */
    async remove(id, actorId) {
        const user = await User.findByPk(id);
        if (!user) {
            const err = new Error("USER_NOT_FOUND");
            err.status = 404;
            throw err;
        }

        await user.destroy();

        await ActivityLog.create({
            user_id: actorId,
            action: "delete_user",
            description: `User ${user.username} dihapus`,
            resource: "users",
            resource_id: id,
            timestamp: new Date()
        });

        return true;
    }

    /* DETAIL */
    async get(id) {
        const user = await User.findByPk(id);
        if (!user) {
            const err = new Error("USER_NOT_FOUND");
            err.status = 404;
            throw err;
        }
        return user;
    }

    /* LIST (Paginated) */
    async list({ page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;

        const result = await User.findAndCountAll({
            limit,
            offset,
            order: [["id", "DESC"]]
        });

        return fromSequelizeFindAndCount(result, page, limit);
    }

    async importCsv(file, actorId) {
        if (!file) {
            const err = new Error("FILE_REQUIRED");
            err.status = 400;
            throw err;
        }

        const rows = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(file.path)
                .pipe(csvParser())
                .on("data", row => rows.push(row))
                .on("end", async () => {
                    const created = [];
                    const skipped = [];

                    for (const r of rows) {
                        try {
                            const exists = await User.findOne({
                                where: { username: r.username }
                            });

                            if (exists) {
                                skipped.push({
                                    row: r,
                                    reason: "USERNAME_EXISTS"
                                });
                                continue;
                            }

                            const passwordHash = await bcrypt.hash(
                                "user12345",
                                10
                            );

                            const user = await User.create({
                                nisn: r.nisn || null,
                                username: r.username,
                                nama_lengkap: r.nama_lengkap,
                                role: r.role,
                                kelas_id: r.kelas_id || null,
                                jurusan_id: r.jurusan_id || null,
                                email: r.email || null,
                                password: passwordHash,
                                created_at: new Date(),
                                updated_at: new Date()
                            });

                            created.push(user);
                        } catch (err) {
                            skipped.push({
                                row: r,
                                reason: err.message
                            });
                        }
                    }

                    // Activity log
                    await ActivityLog.create({
                        user_id: actorId,
                        action: "import_user_csv",
                        description: `Import ${created.length} user`,
                        resource: "users",
                        timestamp: new Date()
                    });

                    resolve({
                        created_count: created.length,
                        skipped_count: skipped.length,
                        skipped
                    });
                })
                .on("error", reject);
        });
    }
    
    async exportCsv() {
    const users = await User.findAll({
        raw: true,
        attributes: [
            "id",
            "nisn",
            "username",
            "nama_lengkap",
            "role",
            "kelas_id",
            "jurusan_id",
            "email",
            "is_active"
        ]
    });

    const parser = new Parser();
    const csv = parser.parse(users);

    return csv;
}
}

module.exports = new UserService();
