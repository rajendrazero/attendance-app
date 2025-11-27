const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("kelas", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            nama_kelas: {
                type: DataTypes.STRING(20),
                allowNull: false
            },

            tingkat: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            jurusan_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "jurusan", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            wali_kelas_id: {
                type: DataTypes.INTEGER,
                references: { model: "users", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },

            tahun_ajaran: {
                type: DataTypes.STRING(9),
                allowNull: false
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },

            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        });
    },

    async down({ context: q }) {
        await q.dropTable("kelas");
    }
};