const users = require('../models/users'); // --- Import mock data ---

// --- Send a standard error response ---
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
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