const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ValidationLog = sequelize.define(
  "ValidationLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    absensi_id: { type: DataTypes.INTEGER, allowNull: false },

    validator_id: { type: DataTypes.INTEGER, allowNull: false },

    status_sebelum: { type: DataTypes.STRING(20) },

    status_sesudah: { type: DataTypes.STRING(20) },

    action: { type: DataTypes.STRING(50), allowNull: false },

    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "validation_log",
    timestamps: false,
  }
);

module.exports = ValidationLog;