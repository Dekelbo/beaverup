const express = require('express');
const learningItemController = require('../controllers/learningItemController');
const { isAdmin, isOwnerOrAdminByBodyUserId, isOwnerOrAdminByUserParam } = require('../middleware/auth');
const {
    validateEnum,
    validateNumericBodyField,
    validateNumericParam,
    validateRequiredFields,
    validateUserIdBody
} = require('../middleware/validation');

const router = express.Router();

const learningItemRequiredFields = ['userId', 'language', 'type', 'sourceText', 'meaning'];
const validateLearningItemId = validateNumericParam('id', 'id', 'Invalid learning item id.');
const validateUserIdParam = validateNumericParam('userId', 'userId', 'Invalid user id.');
const validateLearningItemType = validateEnum(
    'type',
    ['word', 'phrase', 'rewrite', 'expression', 'grammar', 'culture', 'song'],
    'Invalid learning item type.'
);
const validateInteractionIdBody = validateNumericBodyField('interactionId', 'Invalid interaction id.');

router.get('/', isAdmin, learningItemController.getAllLearningItems);
router.get('/user/:userId', validateUserIdParam, isOwnerOrAdminByUserParam, learningItemController.getLearningItemsByUserId);
router.get('/:id/details', validateLearningItemId, learningItemController.getLearningItemDetails);
router.get('/:id', validateLearningItemId, learningItemController.getLearningItemById);
router.post(
    '/',
    validateRequiredFields(learningItemRequiredFields, 'Missing required learning item fields.'),
    validateUserIdBody,
    validateLearningItemType,
    validateInteractionIdBody,
    isOwnerOrAdminByBodyUserId,
    learningItemController.createLearningItem
);
router.put('/:id', validateLearningItemId, validateUserIdBody, validateLearningItemType, learningItemController.updateLearningItem);
router.delete('/:id', validateLearningItemId, learningItemController.deleteLearningItem);

module.exports = router;
