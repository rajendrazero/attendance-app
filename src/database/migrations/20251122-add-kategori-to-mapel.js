// src/database/migrations/20251122-add-kategori-to-mapel.js
const { DataTypes } = require("sequelize");

module.exports = {
  async up({ context: q }) {
    await q.addColumn("mapel", "kategori", { type: DataTypes.STRING(50), allowNull: true });
  },

  async down({ context: q }) {
    await q.removeColumn("mapel", "kategori");
  }
};