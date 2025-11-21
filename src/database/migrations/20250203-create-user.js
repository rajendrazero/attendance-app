const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("users", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

            nisn: { type: DataTypes.STRING(20), unique: true },
            username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
            email: { type: DataTypes.STRING(100), unique: true },

            password: { type: DataTypes.STRING(255), allowNull: false },

            role: {
                type: DataTypes.ENUM(
                    "super_admin",
                    "bk",
                    "wali_kelas",
                    "guru_mapel",
                    "perangkat_kelas",
                    "siswa"
                ),
                allowNull: false
            },

            nama_lengkap: { type: DataTypes.STRING(100), allowNull: false },

            kelas_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            jurusan_id: {
                type: DataTypes.INTEGER,
                references: { model: "jurusan", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },

            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

            last_login: { type: DataTypes.DATE },

            // FIELD BARU
            token_version: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },

            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("users");
    }
};