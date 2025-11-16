module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("mapel", [
            {
                nama_mapel: "Bahasa Indonesia",
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                nama_mapel: "Matematika",
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                nama_mapel: "Pemrograman Web",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("mapel", null);
    }
};
