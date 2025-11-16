const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("kelas", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

            nama_kelas: { type: DataTypes.STRING(50), allowNull: false },
            tingkat: { type: DataTypes.INTEGER },

            jurusan_id: {
                type: DataTypes.INTEGER,
                references: { model: "jurusan", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },

            wali_kelas_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "users", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },

            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("kelas");
    }
};