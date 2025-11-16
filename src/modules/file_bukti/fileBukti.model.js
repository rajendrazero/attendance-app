const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const FileBukti = sequelize.define(
  "FileBukti",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    filename: { type: DataTypes.STRING(255), allowNull: false },

    original_name: { type: DataTypes.STRING(255), allowNull: false },

    path: { type: DataTypes.STRING(500), allowNull: false },

    mime_type: { type: DataTypes.STRING(100), allowNull: false },

    size: { type: DataTypes.INTEGER, allowNull: false },

    uploaded_by: { type: DataTypes.INTEGER, allowNull: false },

    absensi_id: { type: DataTypes.INTEGER },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "file_bukti",
    timestamps: false,
  }
);

module.exports = FileBukti;