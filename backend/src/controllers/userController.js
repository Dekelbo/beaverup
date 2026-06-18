const bcrypt = require('bcryptjs');
const { Interaction, LearningItem, User } = require('../../models');
const { sendError, sendSuccess } = require('../utils/responses');
const { sanitizeUser } = require('../utils/sanitize');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ order: [['userId', 'ASC']] });
        return sendSuccess(res, 200, users.map(sanitizeUser));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get users.');
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        return sendSuccess(res, 200, sanitizeUser(user));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user.');
    }
};

const getUserWithInteractions = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Interaction, as: 'interactions' }]
        });

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        return sendSuccess(res, 200, sanitizeUser(user));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user interactions.');
    }
};

const getUserWithLearningItems = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: LearningItem, as: 'learningItems' }]
        });

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        return sendSuccess(res, 200, sanitizeUser(user));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user learning items.');
    }
};

const getUserSummary = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        const [interactionCount, learningItemCount] = await Promise.all([
            Interaction.count({ where: { userId: req.params.id } }),
            LearningItem.count({ where: { userId: req.params.id } })
        ]);

        return sendSuccess(res, 200, {
            user: sanitizeUser(user),
            interactionCount,
            learningItemCount
        });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user summary.');
    }
};

const createUser = async (req, res) => {
    try {
        const { firstName, lastName, userRole, userNativeLanguage, languageToLearn, currentLevel, email, password } = req.body;
        const passwordHash = await bcrypt.hash(password || 'password123', 10);
        const newUser = await User.create({
            firstName,
            lastName,
            userRole,
            userNativeLanguage,
            languageToLearn,
            currentLevel,
            email: String(email || `${Date.now()}@beaverup.local`).toLowerCase(),
            passwordHash
        });

        return sendSuccess(res, 201, sanitizeUser(newUser));
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendError(res, 400, 'EMAIL_EXISTS', 'Email already exists.');
        }

        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not create user.');
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        const allowedFields = [
            'firstName',
            'lastName',
            'userRole',
            'userNativeLanguage',
            'languageToLearn',
            'currentLevel',
            'email'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = field === 'email' ? String(req.body[field]).toLowerCase() : req.body[field];
            }
        });

        if (req.body.password) {
            user.passwordHash = await bcrypt.hash(req.body.password, 10);
        }

        await user.save();
        return sendSuccess(res, 200, sanitizeUser(user));
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendError(res, 400, 'EMAIL_EXISTS', 'Email already exists.');
        }

        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not update user.');
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        await user.destroy();
        return sendSuccess(res, 200, { userId: req.params.id, message: 'User deleted successfully.' });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete user.');
    }
};

module.exports = {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getUserSummary,
    getUserWithInteractions,
    getUserWithLearningItems,
    updateUser
};
