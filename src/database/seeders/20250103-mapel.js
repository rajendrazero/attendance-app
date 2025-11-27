module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("mapel", [
            {
                id: 1,
                kode_mapel: "RPL101",
                nama_mapel: "Pemrograman Dasar",
                kategori: "Wajib",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("mapel");
    }
};