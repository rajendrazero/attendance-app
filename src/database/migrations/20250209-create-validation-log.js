const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("validation_log", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            absensi_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "absensi", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            validator_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "users", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },

            status_sebelum: { type: DataTypes.STRING(20) },
            status_sesudah: { type: DataTypes.STRING(20) },

            action: { type: DataTypes.STRING(50), allowNull: false },

            timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("validation_log");
    }
};
