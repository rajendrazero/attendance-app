const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Mapel = sequelize.define(
  "Mapel",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    kode_mapel: { type: DataTypes.STRING(10), unique: true, allowNull: false },

    nama_mapel: { type: DataTypes.STRING(50), allowNull: false },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    tableName: "mapel",
    timestamps: false,
  }
);

module.exports = Mapel;