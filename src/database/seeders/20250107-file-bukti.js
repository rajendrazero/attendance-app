module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("file_bukti", [
            {
                id: 1,
                filename: "izin_123.pdf",
                original_name: "izin.pdf",
                path: "/uploads/izin_123.pdf",
                mime_type: "application/pdf",
                size: 20000,
                uploaded_by: 3,
                absensi_id: 1,
                created_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("file_bukti");
    }
};
