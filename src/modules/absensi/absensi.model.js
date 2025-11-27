// src/modules/attendance/attendance.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Absensi = sequelize.define(
  "Absensi",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    student_id: { type: DataTypes.INTEGER, allowNull: false },

    tanggal: { type: DataTypes.DATEONLY, allowNull: false },

    jam_ke: { type: DataTypes.INTEGER, allowNull: true },

    status: {
      type: DataTypes.ENUM("hadir", "sakit", "izin", "tanpa_keterangan"),
      allowNull: false,
    },

    keterangan: { type: DataTypes.TEXT },

    bukti_file: { type: DataTypes.STRING(255) },
    
    semester_id: { type: DataTypes.INTEGER },

    created_by: { type: DataTypes.INTEGER, allowNull: false },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

    validated_by: { type: DataTypes.INTEGER },

    validated_at: { type: DataTypes.DATE },

    is_validated: { type: DataTypes.BOOLEAN, defaultValue: false },

    mapel_id: { type: DataTypes.INTEGER },
  },
  {
    tableName: "absensi",
    timestamps: false,
  }
);

module.exports = Absensi;