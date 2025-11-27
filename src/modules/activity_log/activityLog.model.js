const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    user_id: { type: DataTypes.INTEGER, allowNull: false },

    action: { type: DataTypes.STRING(100), allowNull: false },

    description: { type: DataTypes.TEXT },

    resource: { type: DataTypes.STRING(50) },

    resource_id: { type: DataTypes.INTEGER },

    ip_address: { type: DataTypes.STRING(45) },

    user_agent: { type: DataTypes.TEXT },

    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "activity_log",
    timestamps: false,
  }
);

module.exports = ActivityLog;