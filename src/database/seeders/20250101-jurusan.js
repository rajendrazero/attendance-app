module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("jurusan", [
            {
                kode_jurusan: "RPL",
                nama_jurusan: "Rekayasa Perangkat Lunak",
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                kode_jurusan: "TKJ",
                nama_jurusan: "Teknik Komputer dan Jaringan",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("jurusan", null);
    }
};