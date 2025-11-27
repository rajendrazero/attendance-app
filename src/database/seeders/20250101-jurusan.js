module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("jurusan", [
            {
                id: 1,
                kode_jurusan: "RPL",
                nama_jurusan: "Rekayasa Perangkat Lunak",
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 2,
                kode_jurusan: "TKJ",
                nama_jurusan: "Teknik Komputer & Jaringan",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("jurusan");
    }
};