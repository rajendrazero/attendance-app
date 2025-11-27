// src/app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Logger & Middlewares
const logger = require("./config/logger");
const responseFormatter = require("./middleware/response.middleware");
const errorHandler = require("./middleware/error.middleware");
const requestId = require("./middleware/requestId.middleware");
const userLogger = require("./middleware/userLogger.middleware");

// Swagger
const { swaggerUi, swaggerSpec } = require("./config/swagger");

// ==== INITIALIZE APP ====
const app = express();

/* -------------------------------------------
 * 1. SECURITY & BASE MIDDLEWARES
 * -----------------------------------------*/
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------
 * 2. REQUEST-ID (Tracing)
 * -----------------------------------------*/
app.use(requestId);

/* -------------------------------------------
 * 3. USER LOGGER (inject userId, role)
 * -----------------------------------------*/
app.use(userLogger);

/* -------------------------------------------
 * 4. REQUEST LOGGING (Morgan → Winston)
 * -----------------------------------------*/
app.use(morgan("combined", { stream: logger.stream }));

/* -------------------------------------------
 * 5. API DOCUMENTATION (Swagger)
 * -----------------------------------------*/
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* -------------------------------------------
 * 6. GLOBAL RESPONSE FORMATTER
 * -----------------------------------------*/
app.use(responseFormatter);

/* -------------------------------------------
 * 7. HEALTH CHECK
 * -----------------------------------------*/
app.get("/health", (req, res) => {
    return res.success(
        {
            uptime: process.uptime(),
            timestamp: new Date(),
            requestId: req.requestId
        },
        "OK"
    );
});

/* -------------------------------------------
 * 8. AUTO LOAD MODULE ROUTES
 * -----------------------------------------*/
const modulesPath = path.join(__dirname, "modules");
const moduleFolders = fs.readdirSync(modulesPath);

for (const folder of moduleFolders) {
    const indexPath = path.join(modulesPath, folder, "index.js");

    if (!fs.existsSync(indexPath)) continue;

    const mod = require(indexPath);

    /** VALIDASI ROUTES */
    let routes = null;

    // export = router
    if (typeof mod === "function") {
        routes = mod;
    }

    // export = { routes: router }
    else if (
        mod &&
        typeof mod === "object" &&
        typeof mod.routes === "function"
    ) {
        routes = mod.routes;
    }

    if (!routes) {
        logger.warn(
            `Module '${folder}' tidak memiliki routes yang valid. Melewati...`
        );
        continue;
    }

    const routeName = `/api/${folder}`;
    app.use(routeName, routes);
    logger.info(`Mounted module route: ${routeName}`);
}

/* -------------------------------------------
 * 9. 404 HANDLER
 * -----------------------------------------*/
app.use((req, res) => {
    return res.error("Endpoint tidak ditemukan", "NOT_FOUND", 404);
});

/* -------------------------------------------
 * 10. GLOBAL ERROR HANDLER
 * -----------------------------------------*/
app.use(errorHandler);

module.exports = app;
