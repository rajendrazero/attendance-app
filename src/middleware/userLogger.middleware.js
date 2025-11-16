// src/middleware/userLogger.middleware.js
const logger = require("../config/logger");

module.exports = (req, res, next) => {
    if (req.user) {
        logger.defaultMeta = {
            ...logger.defaultMeta,
            userId: req.user.id,
            role: req.user.role
        };
    } else {
        logger.defaultMeta = {
            ...logger.defaultMeta,
            userId: null,
            role: null
        };
    }
    next();
};