module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("guru_mapel_kelas", [
            {
                id: 1,
                guru_id: 2,
                kelas_id: 1,
                mapel_id: 1,
                tahun_ajaran: "2024/2025",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("guru_mapel_kelas");
    }
};
