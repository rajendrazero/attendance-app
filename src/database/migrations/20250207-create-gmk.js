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
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            mapel_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "mapel", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            kelas_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "kelas", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            tahun_ajaran: {
                type: DataTypes.STRING(9),
                allowNull: false
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },

            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        });

        // UNIQUE INDEX: guru_id + kelas_id + mapel_id + tahun_ajaran
        await q.addConstraint("guru_mapel_kelas", {
            fields: ["guru_id", "kelas_id", "mapel_id", "tahun_ajaran"],
            type: "unique",
            name: "unique_guru_mapel_kelas_combination"
        });
    },

    async down({ context: q }) {
        await q.dropTable("guru_mapel_kelas");
    }
};