const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: q }) {
        await q.createTable("activity_log", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "users", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },

            action: { type: DataTypes.STRING(100), allowNull: false },

            description: { type: DataTypes.TEXT },

            resource: { type: DataTypes.STRING(50) },

            resource_id: { type: DataTypes.INTEGER },

            ip_address: { type: DataTypes.STRING(45) },

            user_agent: { type: DataTypes.TEXT },

            timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        });
    },

    async down({ context: q }) {
        await q.dropTable("activity_log");
    }
};
