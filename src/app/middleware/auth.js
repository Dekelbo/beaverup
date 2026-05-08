// --- Middleware to verify if the user has admin privileges ---
const isAdmin = (req, res, next) => {
    const userRole = req.headers['x-user-role']; // ---> Extract role from header

    if (userRole === 'admin') {
        // --- Role is authorized, move to the next function ---
        next();
    } else {
        // --- Unauthorized role, stop the chain and return 403 ---
        res.status(403).json({
            success: false,
            data: null,
            error: {
                code: "FORBIDDEN",
                message: "You do not have permission to perform this action.",
                details: {
                    requiredRole: "admin",
                    providedRole: userRole || "none"
                }
            }
        });
    }
};

module.exports = { isAdmin };