// --- Middleware to verify if the user is an Admin ---
const isAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];

    if (role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            data: null,
            error: {
                code: 'FORBIDDEN',
                message: 'Admin role required for this action.',
                details: { requiredRole: 'admin' }
            }
        });
    }
};

// --- Middleware to verify if the user is an Admin OR the Owner of the data ---
const isOwnerOrAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];
    const loggedInUserId = req.headers['x-user-id'];
    const targetId = req.params.userId || req.params.id || req.body.userId;

    if (role === 'admin' || (loggedInUserId && String(loggedInUserId) === String(targetId))) {
        next();
    } else {
        res.status(403).json({
            success: false,
            data: null,
            error: {
                code: 'FORBIDDEN',
                message: 'You can only access your own data or must be an admin.',
                details: { requiredOwnerId: targetId || null }
            }
        });
    }
};

module.exports = { isAdmin, isOwnerOrAdmin };
