module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("kelas", [
            {
                id: 1,
                nama_kelas: "X RPL 1",
                tingkat: 10,
                jurusan_id: 1,
                wali_kelas_id: null,
                tahun_ajaran: "2024/2025",
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 2,
                nama_kelas: "XI TKJ 2",
                tingkat: 11,
                jurusan_id: 2,
                wali_kelas_id: null,
                tahun_ajaran: "2024/2025",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("kelas");
    }
};