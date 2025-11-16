const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("validation_log", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

            absensi_id: {
                type: DataTypes.INTEGER,
                references: { model: "absensi", key: "id" }
            },

            validator_id: {
                type: DataTypes.INTEGER,
                references: { model: "users", key: "id" }
            },

            keterangan: { type: DataTypes.STRING(255) },

            timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("validation_log");
    }
};