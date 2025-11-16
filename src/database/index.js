const { Umzug, SequelizeStorage } = require("umzug");
const sequelize = require("../config/db");
const path = require("path");

/**
 * IMPORTANT:
 * context harus berupa QUERY INTERFACE
 */ 
const queryInterface = sequelize.getQueryInterface();

/* ------------------------------------------
 * MIGRATOR
 * -----------------------------------------*/
const migrator = new Umzug({
    migrations: {
        glob: path.join(__dirname, "migrations/*.js")
    },
    context: queryInterface,
    storage: new SequelizeStorage({
        sequelize,
        tableName: "migrations"
    }),
    logger: console
});

/* ------------------------------------------
 * SEEDER
 * -----------------------------------------*/
const seeder = new Umzug({
    migrations: {
        glob: path.join(__dirname, "seeders/*.js") // kalau belum ada, buat folder seeders
    },
    context: queryInterface,
    storage: new SequelizeStorage({
        sequelize,
        tableName: "seeders"
    }),
    logger: console
});

module.exports = { migrator, seeder };