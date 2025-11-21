module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("users", [
            {
                id: 1,
                nisn: null,
                username: "superadmin",
                email: "admin@example.com",
                password: "$2b$10$IbBvFcM0.TW/eXuoxvodTO19YfB8ENhHq3JyGkVKPayKH8vYguw7e",
                role: "super_admin",
                nama_lengkap: "Super Administrator",
                kelas_id: null,
                jurusan_id: null,
                is_active: true,
                last_login: null,
                token_version: 0,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 2,
                nisn: null,
                username: "guru_rpl",
                email: "guru.rpl@example.com",
                password: "$2b$10$IbBvFcM0.TW/eXuoxvodTO19YfB8ENhHq3JyGkVKPayKH8vYguw7e",
                role: "guru_mapel",
                nama_lengkap: "Guru RPL",
                kelas_id: null,
                jurusan_id: 1,
                is_active: true,
                last_login: null,
                token_version: 0,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 3,
                nisn: "9988776655",
                username: "siswa_rpl",
                email: "siswa@example.com",
                password: "$2b$10$IbBvFcM0.TW/eXuoxvodTO19YfB8ENhHq3JyGkVKPayKH8vYguw7e",
                role: "siswa",
                nama_lengkap: "Siswa Contoh",
                kelas_id: 1,
                jurusan_id: 1,
                is_active: true,
                last_login: null,
                token_version: 0,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },
    async down({ context: q }) {
        await q.bulkDelete("users");
    }
};