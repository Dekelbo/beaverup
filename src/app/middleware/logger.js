// --- Middleware to log every incoming request ---
const logger = (req, res, next) => {
    const method = req.method; // ---> HTTP method
    const url = req.originalUrl; // ---> Requested URL
    const timestamp = new Date().toISOString(); // ---> Request timestamp

    // --- Log details after the response is sent ---
    res.on('finish', () => {
        const statusCode = res.statusCode;
        console.log(`[${timestamp}] ${method} ${url} - Status: ${statusCode}`);
    });

    next();
};

module.exports = logger;
