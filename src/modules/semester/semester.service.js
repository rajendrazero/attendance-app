const Semester = require("./semester.model");
const { Op } = require("sequelize");

class SemesterService {
    async getAll() {
        return Semester.findAll({ order: [["start_date", "ASC"]] });
    }

    async getActiveSemester() {
        const today = new Date().toISOString().slice(0, 10);

        const sem = await Semester.findOne({
            where: {
                start_date: { [Op.lte]: today },
                end_date: { [Op.gte]: today }
            }
        });

        if (!sem) {
            const err = new Error("SEMESTER_TIDAK_DITEMUKAN");
            err.status = 404;
            throw err;
        }

        return sem;
    }

    async create(data) {
        return Semester.create(data);
    }

    async update(id, data) {
        const sem = await Semester.findByPk(id);
        if (!sem) {
            const err = new Error("DATA_TIDAK_DITEMUKAN");
            err.status = 404;
            throw err;
        }

        return sem.update(data);
    }

    async remove(id) {
        const sem = await Semester.findByPk(id);
        if (!sem) {
            const err = new Error("DATA_TIDAK_DITEMUKAN");
            err.status = 404;
            throw err;
        }

        return sem.destroy();
    }
}

module.exports = new SemesterService();
