const users = require('../models/users'); // --- Import mock data ---

// --- Send a standard error response ---
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

// --- Validate CEFR level ---
const isValidLevel = (level) => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level);

// --- Validate user role ---
const isValidRole = (role) => ['admin', 'manager', 'user'].includes(role);

// --- Validate required user fields ---
const validateUserInput = (body, requireAllFields = true) => {
    const allowedFields = ['firstName', 'lastName', 'userRole', 'userNativeLanguage', 'languageToLearn', 'currentLevel'];
    const requiredFields = requireAllFields ? allowedFields : [];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
        return { message: 'Missing required user fields.', details: { missingFields } };
    }

    if (body.userRole && !isValidRole(body.userRole)) {
        return { message: 'Invalid user role.', details: { field: 'userRole', allowedValues: ['admin', 'manager', 'user'] } };
    }

    if (body.currentLevel && !isValidLevel(body.currentLevel)) {
        return { message: 'Invalid current level.', details: { field: 'currentLevel', allowedValues: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] } };
    }

    return null;
};

// --- Get all users ---
const getAllUsers = (req, res) => {
    try {
        res.status(200).json({ success: true, data: users, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get users.');
    }
};

// --- Get user by ID ---
const getUserById = (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (Number.isNaN(userId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', { field: 'id' });
        }

        const user = users.find(u => u.userId === userId);
        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        res.status(200).json({ success: true, data: user, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user.');
    }
};

// --- Create a new user ---
const createUser = (req, res) => {
    try {
        const validationError = validateUserInput(req.body);
        if (validationError) {
            return sendError(res, 400, 'VALIDATION_ERROR', validationError.message, validationError.details);
        }

        const { firstName, lastName, userRole, userNativeLanguage, languageToLearn, currentLevel } = req.body;
        const newId = users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1;
        const now = new Date().toISOString();

        const newUser = {
            userId: newId,
            firstName,
            lastName,
            userRole,
            userNativeLanguage,
            languageToLearn,
            currentLevel,
            createDate: now,
            updateDate: now
        };

        users.push(newUser);

        res.status(201).json({ success: true, data: newUser, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not create user.');
    }
};

// --- Update user ---
const updateUser = (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (Number.isNaN(userId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', { field: 'id' });
        }

        const validationError = validateUserInput(req.body, false);
        if (validationError) {
            return sendError(res, 400, 'VALIDATION_ERROR', validationError.message, validationError.details);
        }

        const user = users.find(u => u.userId === userId);
        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        const allowedFields = ['firstName', 'lastName', 'userRole', 'userNativeLanguage', 'languageToLearn', 'currentLevel'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });
        user.updateDate = new Date().toISOString();

        res.status(200).json({ success: true, data: user, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not update user.');
    }
};

// --- Delete user ---
const deleteUser = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (Number.isNaN(id)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', { field: 'id' });
        }

        const index = users.findIndex(u => u.userId === id);
        if (index === -1) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        users.splice(index, 1);

        res.status(200).json({
            success: true,
            data: { userId: id, message: 'User deleted successfully.' },
            error: null
        });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete user.');
    }
};

// --- Export handlers ---
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
