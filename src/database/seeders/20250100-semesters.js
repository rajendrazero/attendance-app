module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("semesters", [
            {
                tahun_ajaran: "2025/2026",
                semester: 1,
                start_date: "2025-07-01",
                end_date: "2025-12-31",
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                tahun_ajaran: "2025/2026",
                semester: 2,
                start_date: "2026-01-01",
                end_date: "2026-06-30",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("semesters", null);
    }
};
