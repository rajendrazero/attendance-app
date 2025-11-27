


require("dotenv").config();
const { migrator } = require("./index");

(async () => {
    try {
        console.log("⏬ Rolling back last migration...");
        await migrator.down();
        console.log("✅ Rollback done.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Rollback failed:", err);
        process.exit(1);
    }
})();