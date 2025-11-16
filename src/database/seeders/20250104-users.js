const bcrypt = require("bcryptjs");

module.exports = {
    async up({ context: q }) {
        const hash = await bcrypt.hash("password123", 10);

        await q.bulkInsert("users", [
            {
                username: "superadmin",
                password: hash,
                role: "super_admin",
                nama_lengkap: "Super Administrator",
                nisn: null,
                email: "admin@school.test",
                kelas_id: null,
                jurusan_id: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                username: "gururpl",
                password: hash,
                role: "guru_mapel",
                nama_lengkap: "Guru RPL",
                email: "guru@school.test",
                kelas_id: null,
                jurusan_id: 1,
                nisn: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                username: "siswa1",
                password: hash,
                role: "siswa",
                nama_lengkap: "Siswa Pertama",
                nisn: "1234567890",
                kelas_id: 1,
                jurusan_id: 1,
                email: "siswa1@test.com",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("users", null);
    }
};
