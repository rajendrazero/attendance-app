// scripts/diff-model-migration.js
const fs = require("fs");
const path = require("path");
const { DataTypes } = require("sequelize");

const modelsDir = path.join(__dirname, "../src/modules");
const migrationsDir = path.join(__dirname, "../src/database/migrations");

// Utility
function listFilesRecursively(dir) {
    const result = [];
    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            result.push(...listFilesRecursively(full));
        } else {
            result.push(full);
        }
    });
    return result;
}

// Read model field definitions
function extractModelFields(content) {
    const regex = /(\w+):\s*{\s*type:\s*DataTypes\.(\w+)/g;
    const fields = [];
    let match;
    while ((match = regex.exec(content))) {
        fields.push(match[1]);
    }
    return fields;
}

// Read migration field definitions
function extractMigrationFields(content) {
    const regex = /(\w+):\s*{\s*type:\s*DataTypes\.(\w+)/g;
    const fields = [];
    let match;
    while ((match = regex.exec(content))) {
        fields.push(match[1]);
    }
    return fields;
}

// MAIN
console.log("🔍 Checking model vs migration mismatches...\n");

const modelFiles = listFilesRecursively(modelsDir).filter(f => f.endsWith(".model.js"));
const migrationFiles = listFilesRecursively(migrationsDir);

for (const modelFile of modelFiles) {
    const modelName = path.basename(modelFile).replace(".model.js", "");
    const modelContent = fs.readFileSync(modelFile, "utf8");
    const modelFields = extractModelFields(modelContent);

    // find migration with closest name
    const migrationFile = migrationFiles.find(m => m.includes(modelName));
    if (!migrationFile) {
        console.log(`❌ Migration NOT FOUND for model: ${modelName}`);
        continue;
    }

    const migrationContent = fs.readFileSync(migrationFile, "utf8");
    const migrationFields = extractMigrationFields(migrationContent);

    const missingInMigration = modelFields.filter(f => !migrationFields.includes(f));
    const missingInModel = migrationFields.filter(f => !modelFields.includes(f));

    console.log(`\n===== ${modelName.toUpperCase()} =====`);
    console.log("Model Fields:", modelFields);
    console.log("Migration Fields:", migrationFields);

    if (missingInMigration.length === 0 && missingInModel.length === 0) {
        console.log("✓ PERFECT MATCH");
    } else {
        console.log("⚠ Mismatch Detected:");
        if (missingInMigration.length) {
            console.log(" → Missing in migration:", missingInMigration);
        }
        if (missingInModel.length) {
            console.log(" → Missing in model:", missingInModel);
        }
    }
}

console.log("\nDone.");