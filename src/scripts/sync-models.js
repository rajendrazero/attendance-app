// One-time helper: sync Sequelize models to create missing tables in DB
// co-pilot: This script loads all models and calls sequelize.sync({ alter: true })
// Use only in development. It will attempt to create or alter tables to match models.

const sequelize = require("../config/db");

// load models (same as associations loader)
require("../modules/user/user.model");
require("../modules/jurusan/jurusan.model");
require("../modules/kelas/kelas.model");
require("../modules/mapel/mapel.model");
require("../modules/guru_mapel_kelas/gmk.model");
require("../modules/absensi/absensi.model");
require("../modules/validation_log/validationLog.model");
require("../modules/activity_log/activityLog.model");
require("../modules/file_bukti/fileBukti.model");
require("../modules/auth/refreshToken.model");
require("../modules/semester/semester.model");

const loadAssociations = require("../config/associations");

(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ DB connected. Running model sync (alter:true) — this may modify the schema.");

        // load associations so relations are known before sync
        if (typeof loadAssociations === "function") loadAssociations();

        await sequelize.sync({ alter: true });

        console.log("✅ Models synced. Tables should now exist.");
        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Sync failed:", err);
        process.exit(1);
    }
})();
