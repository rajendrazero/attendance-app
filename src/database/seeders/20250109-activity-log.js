module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("activity_log", [
            {
                id: 1,
                user_id: 1,
                action: "LOGIN",
                description: "Super admin login",
                resource: "auth",
                resource_id: null,
                ip_address: "127.0.0.1",
                user_agent: "Mozilla/5.0",
                timestamp: new Date()
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("activity_log");
    }
};
