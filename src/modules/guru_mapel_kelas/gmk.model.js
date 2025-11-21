const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const GuruMapelKelas = sequelize.define(
  "GuruMapelKelas",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    guru_id: { type: DataTypes.INTEGER, allowNull: false },

    kelas_id: { type: DataTypes.INTEGER, allowNull: false },

    mapel_id: { type: DataTypes.INTEGER, allowNull: false },

    tahun_ajaran: { type: DataTypes.STRING(9), allowNull: false },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "guru_mapel_kelas",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["guru_id", "kelas_id", "mapel_id", "tahun_ajaran"],
      },
    ],
  }
);

module.exports = GuruMapelKelas;