const bcrypt = require('bcryptjs');
const { User } = require('../../models');
const { sendError, sendSuccess } = require('../utils/responses');
const { sanitizeUser } = require('../utils/sanitize');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || password.length < 6) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Email and password are required.');
        }

        const user = await User.findOne({ where: { email: String(email).toLowerCase() } });
        if (!user) {
            return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
        }

        return sendSuccess(res, 200, sanitizeUser(user));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not log in.');
    }
};

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, userNativeLanguage, languageToLearn, currentLevel } = req.body;

        if (!firstName || !lastName || !email || !password || !userNativeLanguage || !languageToLearn || !currentLevel) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required signup fields.');
        }

        if (password.length < 6) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters.');
        }

        const normalizedEmail = String(email).toLowerCase();
        const emailExists = await User.findOne({ where: { email: normalizedEmail } });
        if (emailExists) {
            return sendError(res, 400, 'EMAIL_EXISTS', 'Email already exists.');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            userRole: 'user',
            userNativeLanguage,
            languageToLearn,
            currentLevel,
            email: normalizedEmail,
            passwordHash
        });

        return sendSuccess(res, 201, sanitizeUser(newUser));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not sign up.');
    }
};

const getMe = async (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id'], 10);
        const user = await User.findByPk(userId);

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        return sendSuccess(res, 200, sanitizeUser(user));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get current user.');
    }
};

const logout = (req, res) => {
    return sendSuccess(res, 200, { message: 'Logged out successfully.' });
};

module.exports = {
    getMe,
    login,
    logout,
    signup
};
