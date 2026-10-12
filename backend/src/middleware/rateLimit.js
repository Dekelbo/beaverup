const rateLimit = require('express-rate-limit');

const rateLimitedResponse = message => ({
    success: false,
    data: null,
    error: { code: 'TOO_MANY_REQUESTS', message, details: {} }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitedResponse('Too many login/signup attempts. Please try again in a few minutes.')
});

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitedResponse('Too many practice requests. Please slow down and try again shortly.')
});

module.exports = {
    aiLimiter,
    authLimiter
};
