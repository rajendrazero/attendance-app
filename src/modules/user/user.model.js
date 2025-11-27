const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const User = sequelize.define(
    "User",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        nisn: { type: DataTypes.STRING(20), unique: true },

        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

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

        kelas_id: { type: DataTypes.INTEGER },

        jurusan_id: { type: DataTypes.INTEGER },

        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

        last_login: { type: DataTypes.DATE },
        token_version: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

        updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    },
    {
        tableName: "users",
        timestamps: false
    }
);

module.exports = User;
