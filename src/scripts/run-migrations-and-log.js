//co-pilot {Helper script: jalankan migrations satu-per-satu dan catat ke storage Umzug.
// Berguna ketika schema telah dibuat (mis. oleh sequelize.sync) tetapi Umzug
// belum mencatat history-nya. Gunakan ini untuk environment development saja.
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sequelize = require('../config/db');
const { migrator } = require('../database');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected:', sequelize.config.database);

        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.js'))
            .sort();

        for (const file of files) {
            const name = file;
            console.log('\n--> Processing migration:', name);
            const migrationPath = path.join(MIGRATIONS_DIR, file);
            const migration = require(migrationPath);

            // Check if already recorded
            const executed = await migrator.executed();
            if (executed.find(e => e.name === name)) {
                console.log('  - already recorded in storage, skipping');
                continue;
            }

            try {
                if (migration.up) {
                    console.log('  - running up()');
                    // call migration with the same context Umzug uses
                    await migration.up(migrator.options.context);
                } else {
                    console.log('  - no up() exported, marking as executed');
                }

                // record migration as executed in Umzug storage
                await migrator.storage.logMigration({ name });
                console.log('  - recorded in migrations table');
            } catch (err) {
                console.error('  - migration failed:', err.message);
                // If failure is due to existing object, still record to avoid
                // repeated failures when schema already present. Otherwise rethrow.
                const msg = (err.message || '').toLowerCase();
                if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicat')) {
                    console.log('  - known existing-object error, marking migration as executed to sync history');
                    await migrator.storage.logMigration({ name });
                } else {
                    throw err;
                }
            }
        }

        console.log('\nAll migrations processed.');
        process.exit(0);
    } catch (e) {
        console.error('Error running migrations:', e);
        process.exit(1);
    }
})();
