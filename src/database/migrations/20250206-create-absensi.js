const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("absensi", {
            /* ===========================
             * PRIMARY KEY
             * =========================== */
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            /* ===========================
             * FOREIGN KEYS
             * =========================== */
            student_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            created_by: {
                type: DataTypes.INTEGER,
                references: { model: "users", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
                allowNull: true
            },

            validated_by: {
                type: DataTypes.INTEGER,
                references: { model: "users", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
                allowNull: true
            },

            mapel_id: {
                type: DataTypes.INTEGER,
                references: { model: "mapel", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
                allowNull: true
            },

            semester_id: {
                type: DataTypes.INTEGER,
                references: { model: "semesters", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
                allowNull: true
            },

            /* ===========================
             * CORE ABSENSI DATA
             * =========================== */
            tanggal: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },

            jam_ke: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            status: {
                type: DataTypes.ENUM(
                    "hadir",
                    "sakit",
                    "izin",
                    "tanpa_keterangan"
                ),
                allowNull: false
            },

            keterangan: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            bukti_file: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            /* ===========================
             * VALIDATION INFO
             * =========================== */
            validated_at: {
                type: DataTypes.DATE,
                allowNull: true
            },

            is_validated: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },

            /* ===========================
             * METADATA
             * =========================== */
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        });
    },

    async down({ context: q }) {
        await q.dropTable("absensi");
    }
};