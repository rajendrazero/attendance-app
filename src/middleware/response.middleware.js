module.exports = (req, res, next) => {
    res.success = (data = null, message = "Success", meta = null, status = 200) => {
        const payload = {
            success: true,
            message,
            data
        };

        if (meta) payload.meta = meta;

        return res.status(status).json(payload);
    };

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
