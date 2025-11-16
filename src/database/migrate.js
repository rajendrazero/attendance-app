require("dotenv").config();
const { migrator } = require("./index");

(async () => {
    try {
        console.log("🚀 Running migrations...");
        await migrator.up();
        console.log("✅ Migrations completed");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
})();