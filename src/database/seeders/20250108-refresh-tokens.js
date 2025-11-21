module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("refresh_tokens", [
            {
                id: 1,
                token: "dummy_refresh_token_xyz",
                user_id: 1,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                created_at: new Date()
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("refresh_tokens");
    }
};
