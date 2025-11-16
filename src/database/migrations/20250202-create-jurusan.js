const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("jurusan", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            kode_jurusan: { type: DataTypes.STRING(20), unique: true },
            nama_jurusan: { type: DataTypes.STRING(100), allowNull: false },

            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("jurusan");
    }
};