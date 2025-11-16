module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("kelas", [
            {
                nama_kelas: "X RPL 1",
                tingkat: 10,
                jurusan_id: 1,
                wali_kelas_id: null,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                nama_kelas: "XI RPL 1",
                tingkat: 11,
                jurusan_id: 1,
                wali_kelas_id: null,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("kelas", null);
    }
};