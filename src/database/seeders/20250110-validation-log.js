module.exports = {
    async up({ context: q }) {
        await q.bulkInsert("validation_log", [
            {
                id: 1,
                absensi_id: 1,
                validator_id: 1,
                status_sebelum: "izin",
                status_sesudah: "diterima",
                action: "validasi",
                timestamp: new Date()
            }
        ]);
    },

    async down({ context: q }) {
        await q.bulkDelete("validation_log", null, {});
    }
};