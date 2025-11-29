
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