const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("refresh_tokens", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            user_id: {
                type: DataTypes.INTEGER,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE"
            },

            token: { type: DataTypes.STRING(255), allowNull: false },
            expires_at: { type: DataTypes.DATE, allowNull: false },

            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("refresh_tokens");
    }
};
