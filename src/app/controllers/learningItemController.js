const learningItems = require('../models/learningItems'); // --- Import mock data ---

// --- Send a standard error response ---
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

// --- Get all learning items ---
const getAllLearningItems = (req, res) => {
    try {
        res.status(200).json({ success: true, data: learningItems, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get learning items.');
    }
};

// --- Get learning item by ID ---
const getLearningItemById = (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const item = learningItems.find(i => i.itemId === itemId);

        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        res.status(200).json({ success: true, data: item, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get learning item.');
    }
};

// --- Get learning items by user ID ---
const getLearningItemsByUserId = (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userItems = learningItems.filter(i => i.userId === userId);
        res.status(200).json({ success: true, data: userItems, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user learning items.');
    }
};

// --- Create learning item ---
const createLearningItem = (req, res) => {
    try {
        const userId = parseInt(req.body.userId);
        const newId = learningItems.length > 0 ? Math.max(...learningItems.map(i => i.itemId)) + 1 : 1;
        const newItem = {
            itemId: newId,
            userId,
            language: req.body.language,
            type: req.body.type,
            sourceText: req.body.sourceText,
            meaning: req.body.meaning,
            context: req.body.context || null
        };

        learningItems.push(newItem);
        res.status(201).json({ success: true, data: newItem, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not create learning item.');
    }
};

// --- Update learning item ---
const updateLearningItem = (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const item = learningItems.find(i => i.itemId === itemId);

        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        const allowedFields = ['language', 'type', 'sourceText', 'meaning', 'context'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });

        res.status(200).json({ success: true, data: item, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not update learning item.');
    }
};

// --- Delete learning item ---
const deleteLearningItem = (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const index = learningItems.findIndex(i => i.itemId === itemId);

        if (index === -1) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        learningItems.splice(index, 1);
        res.status(200).json({
            success: true,
            data: { itemId, message: 'Learning item deleted successfully.' },
            error: null
        });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete learning item.');
    }
};

module.exports = {
    getAllLearningItems,
    getLearningItemById,
    getLearningItemsByUserId,
    createLearningItem,
    updateLearningItem,
    deleteLearningItem
};

