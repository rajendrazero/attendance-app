const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("guru_mapel_kelas", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            guru_id: {
                type: DataTypes.INTEGER,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            mapel_id: {
                type: DataTypes.INTEGER,
                references: { model: "mapel", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            kelas_id: {
                type: DataTypes.INTEGER,
                references: { model: "kelas", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("guru_mapel_kelas");
    }
};
