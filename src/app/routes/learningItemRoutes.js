const express = require('express');
const router = express.Router();
const learningItems = require('../models/learningItems');
const learningItemController = require('../controllers/learningItemController');
const { isAdmin, isOwnerOrAdminByUserParam, isOwnerOrAdminByBodyUserId, isOwnerOrAdminForResource } = require('../middleware/auth');
const { validateNumericParam, validateRequiredFields, validateUserIdBody, validateEnum } = require('../middleware/validation');

const learningItemRequiredFields = ['userId', 'language', 'type', 'sourceText', 'meaning'];
const validateLearningItemId = validateNumericParam('id', 'id', 'Invalid learning item id.');
const validateUserIdParam = validateNumericParam('userId', 'userId', 'Invalid user id.');
const validateLearningItemType = validateEnum('type', ['word', 'phrase', 'rewrite', 'expression'], 'Invalid learning item type.');
const isLearningItemOwnerOrAdmin = isOwnerOrAdminForResource(learningItems, 'itemId', 'userId');

// --- GET /learning-items (Admin only) ---
router.get('/', isAdmin, learningItemController.getAllLearningItems);

// --- GET /learning-items/user/:userId ---
router.get('/user/:userId', validateUserIdParam, isOwnerOrAdminByUserParam, learningItemController.getLearningItemsByUserId);

// --- GET /learning-items/:id ---
router.get('/:id', validateLearningItemId, isLearningItemOwnerOrAdmin, learningItemController.getLearningItemById);

// --- POST /learning-items ---
router.post('/', validateRequiredFields(learningItemRequiredFields, 'Missing required learning item fields.'), validateUserIdBody, validateLearningItemType, isOwnerOrAdminByBodyUserId, learningItemController.createLearningItem);

// --- PUT /learning-items/:id ---
router.put('/:id', validateLearningItemId, validateUserIdBody, validateLearningItemType, isLearningItemOwnerOrAdmin, learningItemController.updateLearningItem);

// --- DELETE /learning-items/:id ---
router.delete('/:id', validateLearningItemId, isLearningItemOwnerOrAdmin, learningItemController.deleteLearningItem);

module.exports = router;