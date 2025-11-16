module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("guru_mapel_kelas", [
            {
                guru_id: 2, // user guru
                mapel_id: 3, // pemrograman web
                kelas_id: 1, // X RPL 1
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("guru_mapel_kelas", null);
    }
};
