const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("semesters", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            tahun_ajaran: {
                type: DataTypes.STRING(20),
                allowNull: false
            },
            semester: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: "1 = Ganjil, 2 = Genap"
            },

            start_date: { type: DataTypes.DATEONLY, allowNull: false },
            end_date: { type: DataTypes.DATEONLY, allowNull: false },

            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });

        // Optional index untuk performa query
        await q.addIndex("semesters", ["tahun_ajaran", "semester"], {
            unique: true,
            name: "idx_semesters_unique"
        });
    },

    async down({ context: q }) {
        await q.dropTable("semesters");
    }
};
