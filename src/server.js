// src/server.js
/**
require("dotenv").config();

const sequelize = require("./config/db");
const loadAssociations = require("./config/associations");
const { migrator, seeder } = require("./database");
const scheduler = require("./config/scheduler");
const createApp = require("./app");
const logger = require("./config/logger");

const swaggerUi = require("swagger-ui-express");
const { loadSwaggerDoc } = require("./swagger");

const PORT = process.env.PORT || 3000;

(async () => {
    const BOOT = Date.now();

    try {
        logger.info("==============================================");
        logger.info("     ATTENDANCE SYSTEM - SERVER BOOTING...");
        logger.info("==============================================");

        // 1. Validate config
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        // 2. DB check
        logger.info("Checking DB connection...");
        await sequelize.authenticate();
        logger.info("DB OK.");

        // 3. Migrations
        await migrator.up();
        logger.info("Migrations OK.");

        // 4. Associations
        loadAssociations();
        logger.info("Associations OK.");

        // 5. Optional seeder
        if (process.env.RUN_SEEDER === "true") {
            await seeder.up();
            logger.info("Seed OK.");
        }

        // 6. Express app
        const app = createApp();

        // 7. Swagger
        if (process.env.ENABLE_SWAGGER !== "false") {
            try {
                const swaggerDoc = loadSwaggerDoc();

                app.use(
                    "/docs",
                    swaggerUi.serve,
                    swaggerUi.setup(swaggerDoc, {
                        explorer: true,
                        swaggerOptions: { persistAuthorization: true }
                    })
                );

                app.get("/docs/json", (req, res) => res.json(swaggerDoc));

                logger.info("Swagger UI ready at /docs");
            } catch (err) {
                logger.error("Swagger load error:", err);
            }
        }

        // 8. Scheduler
        try {
            scheduler.start();
            logger.info("Scheduler OK.");
        } catch (err) {
            logger.error("Scheduler error:", err);
        }

        // 9. Start HTTP server
        const server = app.listen(PORT, () => {
            const bootTime = ((Date.now() - BOOT) / 1000).toFixed(2);
            logger.info(`Server running at http://localhost:${PORT}`);
            logger.info(`Boot time: ${bootTime}s`);
        });

        // 10. Graceful shutdown
        const stop = async () => {
            logger.warn("Graceful shutdown started...");

            try {
                await sequelize.close();
                logger.info("DB closed.");
            } catch (err) {
                logger.error("Error closing DB:", err);
            }

            server.close(() => {
                logger.info("HTTP server closed.");
                process.exit(0);
            });

            setTimeout(() => {
                logger.error("Force exit after timeout.");
                process.exit(1);
            }, 8000).unref();
        };

        process.on("SIGINT", stop);
        process.on("SIGTERM", stop);

        process.on("unhandledRejection", err =>
            logger.error("Unhandled Rejection:", err)
        );

        process.on("uncaughtException", err => {
            logger.error("Uncaught Exception:", err);
            stop();
        });
    } catch (err) {
        logger.error("Fatal error:", err);
        process.exit(1);
    }
})();
**/

// src/server.js
require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/db");
const loadAssociations = require("./config/associations");
const { migrator, seeder } = require("./database");
const scheduler = require("./config/scheduler");

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        // 1. TEST DB CONNECTION
        await sequelize.authenticate();
        console.log("✅ Database connected.");

        // 2. RUN MIGRATIONS (HARUS SEBELUM ASSOCIATIONS)
        //console.log("Running migrations...");
        //await migrator.up();
        //console.log("✅ Migrations completed.");

        // 3. LOAD ASSOCIATIONS (JANGAN ADA .sync() DI DALAMNYA)
        if (typeof loadAssociations === "function") {
            loadAssociations();
            console.log("✅ Associations loaded.");
        } else {
            console.warn("⚠️ associations.js not found or invalid function.");
        }

        // 4. OPTIONAL SEEDER
        // await seeder.up();

        // 5. START SCHEDULER
        scheduler.start();

        // 6. START SERVER
        const server = app.listen(PORT, () => {
            console.log(
                `🚀 Server running at http://localhost:${PORT} (env: ${
                    process.env.NODE_ENV || "development"
                })`
            );
        });

        // 7. GRACEFUL SHUTDOWN
        const gracefulShutdown = async () => {
            console.log("🔄 Graceful shutdown started...");
            try {
                await sequelize.close();
                console.log("✅ DB connection closed.");
            } catch (err) {
                console.error("Error closing DB:", err);
            }
            server.close(() => {
                console.log("✅ HTTP server closed.");
                process.exit(0);
            });

            setTimeout(() => {
                console.error("Force exit after timeout.");
                process.exit(1);
            }, 10000).unref();
        };

        process.on("SIGINT", gracefulShutdown);
        process.on("SIGTERM", gracefulShutdown);

        process.on("unhandledRejection", (reason, p) => {
            console.error("Unhandled Rejection:", reason);
        });

        process.on("uncaughtException", err => {
            console.error("Uncaught Exception:", err);
            gracefulShutdown();
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
})();
