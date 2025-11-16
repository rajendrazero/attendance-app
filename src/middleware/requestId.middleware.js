// src/middleware/requestId.middleware.js
const { v4: uuid } = require("uuid");

module.exports = (req, res, next) => {
    const requestId =
        req.headers["x-request-id"] || uuid();

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    next();
};