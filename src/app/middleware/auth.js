// --- Middleware to verify if the user is an Admin ---
const isAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];

    if (role === 'admin') {
        return next();
    }

    return res.status(403).json({
        success: false,
        data: null,
        error: {
            code: 'FORBIDDEN',
            message: 'Admin role required for this action.',
            details: { requiredRole: 'admin' }
        }
    });
};

// --- Middleware to verify if the user is an Admin or manager ---
const isAdminOrManager = (req, res, next) => {
    const role = req.headers['x-user-role'];

    if (role === 'admin' || role === 'manager') {
        return next();
    }

    return res.status(403).json({
        success: false,
        data: null,
        error: {
            code: 'FORBIDDEN',
            message: 'Admin or manager role required for this action.',
            details: { requiredRole: 'manager' }
        }
    });
};

const isOwnerOrAdminByUserId = getUserId => {
    return (req, res, next) => {
        const role = req.headers['x-user-role'];
        const loggedInUserId = req.headers['x-user-id'];
        const targetId = getUserId(req);

        if (role === 'admin' || (loggedInUserId && String(loggedInUserId) === String(targetId))) {
            return next();
        }

        return res.status(403).json({
            success: false,
            data: null,
            error: {
                code: 'FORBIDDEN',
                message: 'You can only access your own data or must be an admin.',
                details: { requiredOwnerId: targetId || null }
            }
        });
    };
}; 

const isAdminOrManagerOrOwner = getUserId => {
    return (req, res, next) => {
        const role = req.headers['x-user-role'];
        const loggedInUserId = req.headers['x-user-id'];
        const targetId = getUserId(req);

        if (role === 'admin' || role === 'manager' || (loggedInUserId && String(loggedInUserId) === String(targetId))) {
            return next();
        }

        return res.status(403).json({
            success: false,
            data: null,
            error: {
                code: 'FORBIDDEN',
                message: 'You can only access your own data or must be a manager or admin.',
                details: { requiredOwnerId: targetId || null }
            }
        });
    };
};

const isOwnerOrAdmin = isOwnerOrAdminByUserId(req => req.params.userId || req.params.id || req.body.userId);
const isOwnerOrAdminByUserParam = isOwnerOrAdminByUserId(req => req.params.userId);
const isOwnerOrAdminByBodyUserId = isOwnerOrAdminByUserId(req => req.body.userId);
const isAdminOrManagerOrOwnerByIdParam = isAdminOrManagerOrOwner(req => req.params.id);

const isOwnerOrAdminForResource = (items, idField, ownerField, paramName = 'id') => {
    return (req, res, next) => {
        const resourceId = parseInt(req.params[paramName]);
        const item = items.find(currentItem => currentItem[idField] === resourceId);

        if (!item) {
            return next();
        }

        return isOwnerOrAdminByUserId(() => item[ownerField])(req, res, next);
    };
};

module.exports = {
    isAdmin,
    isAdminOrManager,
    isAdminOrManagerOrOwner,
    isAdminOrManagerOrOwnerByIdParam,
    isOwnerOrAdmin,
    isOwnerOrAdminByUserParam,
    isOwnerOrAdminByBodyUserId,
    isOwnerOrAdminForResource
};
