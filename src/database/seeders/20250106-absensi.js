module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("absensi", [
            {
                student_id: 3,
                tanggal: "2025-11-10",
                jam_ke: null,
                status: "hadir",
                keterangan: null,
                bukti_file: null,
                created_by: 2,
                is_validated: true,
                validated_by: 2,
                validated_at: new Date(),
                mapel_id: null,
                semester_id: 1,
                created_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("absensi", null);
    }
};
