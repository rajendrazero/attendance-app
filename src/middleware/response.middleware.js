// src/middleware/response.middleware.js
module.exports = (req, res, next) => {
    // SUCCESS RESPONSE
    res.success = (data = null, message = "Success", status = 200) => {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    };

    // ERROR RESPONSE
    res.error = (
        message = "Terjadi kesalahan",
        errorCode = "SERVER_ERROR",
        status = 500,
        details = null
    ) => {
        const payload = {
            success: false,
            message,
            error: errorCode
        };

        if (details) payload.details = details;

        return res.status(status).json(payload);
    };

    next();
};