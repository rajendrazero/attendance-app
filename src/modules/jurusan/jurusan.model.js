const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Jurusan = sequelize.define(
  "Jurusan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    kode_jurusan: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false
    },

    nama_jurusan: {
      type: DataTypes.STRING(50),
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
  },
  {
    tableName: "jurusan",
    timestamps: false
  }
);

module.exports = Jurusan;