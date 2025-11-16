// src/config/logger.js
/**
const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

// ===============================
// CREATE LOG DIRECTORY IF MISSING
// ===============================
const LOG_DIR = process.env.LOG_DIR || "logs";

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ===============================
// LOG FORMATTER
// ===============================
const devFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

const jsonFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// ===============================
// DAILY ROTATION CONFIG
// ===============================
const dailyRotateTransport = new transports.DailyRotateFile({
    filename: path.join(LOG_DIR, "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "info"
});

const errorRotateTransport = new transports.DailyRotateFile({
    filename: path.join(LOG_DIR, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "60d",
    level: "error"
});

// ===============================
// BASE LOGGER CONFIG
// ===============================
const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { service: "attendance-app" },
    format: process.env.NODE_ENV === "production" ? jsonFormat : devFormat,
    transports: [
        new transports.Console({
            handleExceptions: true,
            level: process.env.NODE_ENV === "production" ? "info" : "debug"
        }),
        dailyRotateTransport,
        errorRotateTransport
    ],
    exitOnError: false
});

// ==========================================
// Morgan Stream (Routing Traffic → Winston)
// ==========================================
logger.stream = {
    write: message => logger.http(message.trim())
};

// ==========================================
// Graceful fail-safety for unhandled errors
// ==========================================
process.on("unhandledRejection", reason => {
    logger.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", err => {
    logger.error("UNCAUGHT EXCEPTION:", err);
});

module.exports = logger;

**/

//logger udh ada di config awalnya ganti kan
// src/config/logger.js
const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const dailyRotateTransport = new transports.DailyRotateFile({
filename: "logs/app-%DATE%.log",
datePattern: "YYYY-MM-DD",
zippedArchive: true,
maxSize: "20m",
maxFiles: "30d" // simpan 30 hari log
});

const logger = createLogger({
level: "info",
format: format.combine(
format.timestamp(),
format.json()
),
defaultMeta: { service: "attendance-app" },

transports: [  
    new transports.Console(),  
    dailyRotateTransport  
]

});

// Morgan → Winston
logger.stream = {
write: (message) => logger.info(message.trim())
};

module.exports = logger;