const learningItems = require('../models/learningItems'); // --- Import mock data ---

// --- Send a standard error response ---
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

// --- Check owner or admin access ---
const canAccessUserData = (req, userId) => {
    const role = req.headers['x-user-role'];
    const loggedInUserId = parseInt(req.headers['x-user-id']);
    return role === 'admin' || loggedInUserId === userId;
};

// --- Validate learning item type ---
const isValidType = (type) => ['word', 'phrase', 'rewrite', 'expression'].includes(type);

// --- Validate required learning item fields ---
const validateLearningItemInput = (body, requireAllFields = true) => {
    const requiredFields = requireAllFields ? ['userId', 'language', 'type', 'sourceText', 'meaning'] : [];
    const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === '');

    if (missingFields.length > 0) {
        return { message: 'Missing required learning item fields.', details: { missingFields } };
    }

    if (body.userId !== undefined && Number.isNaN(parseInt(body.userId))) {
        return { message: 'Invalid user id.', details: { field: 'userId' } };
    }

    if (body.type && !isValidType(body.type)) {
        return { message: 'Invalid learning item type.', details: { field: 'type', allowedValues: ['word', 'phrase', 'rewrite', 'expression'] } };
    }

    return null;
};

// ***
// --- Get all learning items ---
const getAllLearningItems = (req, res) => {
    try {
        res.status(200).json({ success: true, data: learningItems, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get learning items.');
    }
};
// ***

// ***
// --- Get learning item by ID ---
const getLearningItemById = (req, res) => {
    try {
        const itemId = parseInt(req.params.id);

        if (Number.isNaN(itemId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid learning item id.', { field: 'id' });
        }

        const item = learningItems.find(i => i.itemId === itemId);
        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        if (!canAccessUserData(req, item.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to access this learning item.');
        }

        res.status(200).json({ success: true, data: item, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get learning item.');
    }
};
// ***

// ***
// --- Get learning items by user ID ---
const getLearningItemsByUserId = (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (Number.isNaN(userId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', { field: 'userId' });
        }

        if (!canAccessUserData(req, userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to access these learning items.');
        }

        const userItems = learningItems.filter(i => i.userId === userId);
        res.status(200).json({ success: true, data: userItems, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user learning items.');
    }
};
// ***

// ***
// --- Create learning item ---
const createLearningItem = (req, res) => {
    try {
        const validationError = validateLearningItemInput(req.body);
        if (validationError) {
            return sendError(res, 400, 'VALIDATION_ERROR', validationError.message, validationError.details);
        }

        const userId = parseInt(req.body.userId);
        if (!canAccessUserData(req, userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to create this learning item.');
        }

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
// ***

// ***
// --- Update learning item ---
const updateLearningItem = (req, res) => {
    try {
        const itemId = parseInt(req.params.id);

        if (Number.isNaN(itemId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid learning item id.', { field: 'id' });
        }

        const validationError = validateLearningItemInput(req.body, false);
        if (validationError) {
            return sendError(res, 400, 'VALIDATION_ERROR', validationError.message, validationError.details);
        }

        const item = learningItems.find(i => i.itemId === itemId);
        if (!item) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        if (!canAccessUserData(req, item.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to update this learning item.');
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
// ***

// ***
// --- Delete learning item ---
const deleteLearningItem = (req, res) => {
    try {
        const itemId = parseInt(req.params.id);

        if (Number.isNaN(itemId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid learning item id.', { field: 'id' });
        }

        const index = learningItems.findIndex(i => i.itemId === itemId);
        if (index === -1) {
            return sendError(res, 404, 'LEARNING_ITEM_NOT_FOUND', 'Learning item not found.');
        }

        if (!canAccessUserData(req, learningItems[index].userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to delete this learning item.');
        }

        learningItems.splice(index, 1);
        res.status(200).json({ success: true, data: { itemId, message: 'Learning item deleted successfully.' }, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete learning item.');
    }
};
// ***

module.exports = {
    getAllLearningItems,
    getLearningItemById,
    getLearningItemsByUserId,
    createLearningItem,
    updateLearningItem,
    deleteLearningItem
};
