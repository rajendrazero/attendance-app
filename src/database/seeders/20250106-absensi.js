module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("absensi", [
            {
                id: 1,
                student_id: 3,
                tanggal: "2024-09-01",
                jam_ke: 1,
                status: "hadir",
                keterangan: null,
                bukti_file: null,
                semester_id: 1,
                mapel_id: 1,
                created_by: 2,
                validated_by: null,
                created_at: new Date(),
                validated_at: null,
                is_validated: false
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("absensi");
    }
};