const rateLimit = require("express-rate-limit");

// Rate limit login: 5x percobaan per 5 menit
const loginRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: 5,
    message: {
        success: false,
        message: "Terlalu banyak percobaan login. Coba lagi dalam 5 menit.",
        error: "RATE_LIMIT_LOGIN"
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { loginRateLimit };
