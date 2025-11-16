// src/modules/auth/refreshToken.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type: DataTypes.STRING(500), allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    tableName: 'refresh_tokens',
    timestamps: false
  }
);

module.exports = RefreshToken;