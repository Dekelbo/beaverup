const users = require('../models/users');

const MOCK_PASSWORD_HASH = 'mock-password-123456';

// --- Send a standard error response ---
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

// --- Hide mock password data ---
const sanitizeUser = user => {
    if (!user) {
        return null;
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
};

// --- Login with mock credentials ---
const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || password.length < 6) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Email and password are required.');
        }

        const user = users.find(currentUser => currentUser.email.toLowerCase() === String(email).toLowerCase());

        if (!user) {
            return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
        }

        res.status(200).json({ success: true, data: sanitizeUser(user), error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not log in.');
    }
};

// --- Signup with mock password hash ---
const signup = (req, res) => {
    try {
        const { firstName, lastName, email, password, userNativeLanguage, languageToLearn, currentLevel } = req.body;

        if (!firstName || !lastName || !email || !password || !userNativeLanguage || !languageToLearn || !currentLevel) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required signup fields.');
        }

        if (password.length < 6) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters.');
        }

        const emailExists = users.some(user => user.email.toLowerCase() === String(email).toLowerCase());
        if (emailExists) {
            return sendError(res, 400, 'EMAIL_EXISTS', 'Email already exists.');
        }

        const newId = users.length > 0 ? Math.max(...users.map(user => user.userId)) + 1 : 1;
        const now = new Date().toISOString();
        const newUser = {
            userId: newId,
            firstName,
            lastName,
            userRole: 'user',
            userNativeLanguage,
            languageToLearn,
            currentLevel,
            email,
            passwordHash: MOCK_PASSWORD_HASH,
            createDate: now,
            updateDate: now
        };

        users.push(newUser);
        res.status(201).json({ success: true, data: sanitizeUser(newUser), error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not sign up.');
    }
};

// --- Return current mock user ---
const getMe = (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);
        const user = users.find(currentUser => currentUser.userId === userId);

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        res.status(200).json({ success: true, data: sanitizeUser(user), error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get current user.');
    }
};

// --- Logout mock user ---
const logout = (req, res) => {
    res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully.' },
        error: null
    });
};

module.exports = {
    getMe,
    login,
    logout,
    signup,
    sanitizeUser
};
