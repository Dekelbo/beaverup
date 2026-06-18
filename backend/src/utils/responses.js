const sendSuccess = (res, status, data) => {
    return res.status(status).json({
        success: true,
        data,
        error: null
    });
};

const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: {
            code,
            message,
            details
        }
    });
};

module.exports = {
    sendError,
    sendSuccess
};
