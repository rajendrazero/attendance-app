const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.addColumn("users", "token_version", {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
    },

    async down({ context: q }) {
        await q.removeColumn("users", "token_version");
    }
};