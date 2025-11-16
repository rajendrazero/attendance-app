const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Semester = sequelize.define(
    "Semester",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        tahun_ajaran: { type: DataTypes.STRING(20), allowNull: false },
        semester: { type: DataTypes.INTEGER, allowNull: false },

        start_date: { type: DataTypes.DATEONLY, allowNull: false },
        end_date: { type: DataTypes.DATEONLY, allowNull: false },

        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    },
    {
        tableName: "semesters",
        timestamps: false
    }
);

module.exports = Semester;
