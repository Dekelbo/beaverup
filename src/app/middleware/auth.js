// --- Middleware to verify if the user is an Admin ---
const isAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];

    if (role === 'admin') {
        next(); // --- Role is admin, proceed ---
    } else {
        res.status(403).json({
            success: false,
            data: null,
            error: { code: "FORBIDDEN", message: "Admin role required for this action." }
        });
    }
};

// --- Middleware to verify if the user is an Admin OR the Owner of the data ---
const isOwnerOrAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];
    const loggedInUserId = req.headers['x-user-id']; // --- ID of the person making the request ---
    const targetId = req.params.id; // --- ID from the URL path ---

    // --- Access allowed if: user is Admin OR logged-in ID matches target ID ---
    if (role === 'admin' || (loggedInUserId && loggedInUserId === targetId)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            data: null,
            error: { 
                code: "FORBIDDEN", 
                message: "You can only access your own data or must be an admin." 
            }
        });
    }
};

module.exports = { isAdmin, isOwnerOrAdmin };