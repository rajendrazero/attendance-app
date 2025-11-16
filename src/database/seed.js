require("dotenv").config();
const { seeder } = require("./index");

(async () => {
    try {
        console.log("🌱 Running seeders...");
        await seeder.up();
        console.log("✅ Seeders completed");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeder failed:", err);
        process.exit(1);
    }
})();
