const { Interaction, LearningItem } = require('../../models');
const { getLoggedInUser } = require('../middleware/auth');
const { normalizeSourceText } = require('../utils/learningItems');
const { sendError, sendSuccess } = require('../utils/responses');

const canAccessUserData = (req, userId) => {
    const loggedInUser = getLoggedInUser(req);
    return loggedInUser.role === 'admin' || String(loggedInUser.userId) === String(userId);
};

const serializeLearningItem = item => (typeof item.get === 'function' ? item.get({ plain: true }) : item);

const getAllLearningItems = async (req, res) => {
    try {
        const learningItems = await LearningItem.findAll({ order: [['itemId', 'ASC']] });
        return sendSuccess(res, 200, learningItems);
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get learning items.');
    }
};

const getLearningItemById = async (req, res) => {
    try {
        const item = await LearningItem.findByPk(req.params.id);
        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        if (!canAccessUserData(req, item.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: item.userId
            });
        }

        return sendSuccess(res, 200, serializeLearningItem(item));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get learning item.');
    }
};

const getLearningItemDetails = async (req, res) => {
    try {
        const item = await LearningItem.findByPk(req.params.id, {
            include: [{ model: Interaction, as: 'interactions' }]
        });

        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        if (!canAccessUserData(req, item.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: item.userId
            });
        }

        return sendSuccess(res, 200, serializeLearningItem(item));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get learning item details.');
    }
};

const getLearningItemsByUserId = async (req, res) => {
    try {
        const learningItems = await LearningItem.findAll({
            where: { userId: req.params.userId },
            order: [['itemId', 'ASC']]
        });

        return sendSuccess(res, 200, learningItems);
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user learning items.');
    }
};

const createLearningItem = async (req, res) => {
    try {
        const newItem = await LearningItem.create({
            userId: parseInt(req.body.userId, 10),
            language: req.body.language,
            type: req.body.type,
            sourceText: req.body.sourceText,
            normalizedSourceText: normalizeSourceText(req.body.sourceText),
            meaning: req.body.meaning,
            context: req.body.context || null
        });

        return sendSuccess(res, 201, newItem);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendError(res, 400, 'LEARNING_ITEM_EXISTS', 'Learning item already exists for this user.');
        }

        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not create learning item.');
    }
};

const updateLearningItem = async (req, res) => {
    try {
        const item = await LearningItem.findByPk(req.params.id);
        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        if (!canAccessUserData(req, item.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: item.userId
            });
        }

        ['language', 'type', 'sourceText', 'meaning', 'context'].forEach(field => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });

        if (req.body.sourceText !== undefined) {
            item.normalizedSourceText = normalizeSourceText(req.body.sourceText);
        }

        await item.save();
        return sendSuccess(res, 200, item);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendError(res, 400, 'LEARNING_ITEM_EXISTS', 'Learning item already exists for this user.');
        }

        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not update learning item.');
    }
};

const deleteLearningItem = async (req, res) => {
    try {
        const item = await LearningItem.findByPk(req.params.id);
        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        if (!canAccessUserData(req, item.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: item.userId
            });
        }

        await item.destroy();
        return sendSuccess(res, 200, { itemId: req.params.id, message: 'Learning item deleted successfully.' });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete learning item.');
    }
};

module.exports = {
    createLearningItem,
    deleteLearningItem,
    getAllLearningItems,
    getLearningItemById,
    getLearningItemDetails,
    getLearningItemsByUserId,
    updateLearningItem
};
