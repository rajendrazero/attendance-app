const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("file_bukti", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

            filename: { type: DataTypes.STRING(255), allowNull: false },
            original_name: { type: DataTypes.STRING(255), allowNull: false },
            path: { type: DataTypes.STRING(500), allowNull: false },
            mime_type: { type: DataTypes.STRING(100), allowNull: false },
            size: { type: DataTypes.INTEGER, allowNull: false },

            uploaded_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            absensi_id: {
                type: DataTypes.INTEGER,
                references: { model: "absensi", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },

            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("file_bukti");
    }
};