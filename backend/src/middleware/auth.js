const { sendError } = require('../utils/responses');

const getLoggedInUser = req => ({
    userId: req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null,
    role: req.headers['x-user-role'] || null
});

const isAdmin = (req, res, next) => {
    const { role } = getLoggedInUser(req);

    if (role === 'admin') {
        return next();
    }

    return sendError(res, 403, 'FORBIDDEN', 'Admin role required for this action.', { requiredRole: 'admin' });
};

const isAdminOrManager = (req, res, next) => {
    const { role } = getLoggedInUser(req);

    if (role === 'admin' || role === 'manager') {
        return next();
    }

    return sendError(res, 403, 'FORBIDDEN', 'Admin or manager role required for this action.', {
        requiredRole: 'manager'
    });
};

const isOwnerOrAdminByUserId = getUserId => {
    return (req, res, next) => {
        const { role, userId } = getLoggedInUser(req);
        const targetId = getUserId(req);

        if (role === 'admin' || (userId && String(userId) === String(targetId))) {
            return next();
        }

        return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
            requiredOwnerId: targetId || null
        });
    };
};

const isAdminOrManagerOrOwner = getUserId => {
    return (req, res, next) => {
        const { role, userId } = getLoggedInUser(req);
        const targetId = getUserId(req);

        if (role === 'admin' || role === 'manager' || (userId && String(userId) === String(targetId))) {
            return next();
        }

        return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be a manager or admin.', {
            requiredOwnerId: targetId || null
        });
    };
};

const isOwnerOrAdmin = isOwnerOrAdminByUserId(req => req.params.userId || req.params.id || req.body.userId);
const isOwnerOrAdminByUserParam = isOwnerOrAdminByUserId(req => req.params.userId);
const isOwnerOrAdminByBodyUserId = isOwnerOrAdminByUserId(req => req.body.userId);
const isAdminOrManagerOrOwnerByIdParam = isAdminOrManagerOrOwner(req => req.params.id);

module.exports = {
    getLoggedInUser,
    isAdmin,
    isAdminOrManager,
    isAdminOrManagerOrOwner,
    isAdminOrManagerOrOwnerByIdParam,
    isOwnerOrAdmin,
    isOwnerOrAdminByBodyUserId,
    isOwnerOrAdminByUserId,
    isOwnerOrAdminByUserParam
};
