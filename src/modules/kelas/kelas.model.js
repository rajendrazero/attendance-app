const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Kelas = sequelize.define(
  "Kelas",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    nama_kelas: { type: DataTypes.STRING(20), allowNull: false },

    tingkat: { type: DataTypes.INTEGER, allowNull: false },

    jurusan_id: { type: DataTypes.INTEGER, allowNull: false },

    wali_kelas_id: { type: DataTypes.INTEGER },

    tahun_ajaran: { type: DataTypes.STRING(9), allowNull: false },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    tableName: "kelas",
    timestamps: false
  }
);

module.exports = Kelas;