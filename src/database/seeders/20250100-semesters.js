module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("semesters", [
            {
                id: 1,
                tahun_ajaran: "2024/2025",
                semester: 1,
                start_date: "2024-07-10",
                end_date: "2024-12-10",
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("semesters");
    }
};
