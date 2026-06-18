const express = require('express');
const interactionController = require('../controllers/interactionController');
const { isAdmin, isOwnerOrAdminByBodyUserId, isOwnerOrAdminByUserParam } = require('../middleware/auth');
const {
    validateArrayField,
    validateEnum,
    validateNumericBodyField,
    validateNumericParam,
    validateRequiredFields,
    validateUserIdBody
} = require('../middleware/validation');

const router = express.Router();

const interactionRequiredFields = ['userId', 'mode', 'language', 'level'];
const validateInteractionId = validateNumericParam('id', 'id', 'Invalid interaction id.');
const validateUserIdParam = validateNumericParam('userId', 'userId', 'Invalid user id.');
const validateMode = validateEnum('mode', ['conversation', 'story', 'translate'], 'Invalid interaction mode.');
const validateInteractionType = validateEnum(
    'interactionType',
    ['conversation_turn', 'story_start', 'story_followup', 'translate_request'],
    'Invalid interaction type.'
);
const validateLevel = validateEnum('level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 'Invalid level.');

router.get('/', isAdmin, interactionController.getAllInteractions);
router.get('/user/:userId', validateUserIdParam, isOwnerOrAdminByUserParam, interactionController.getInteractionsByUserId);
router.get('/:id/details', validateInteractionId, interactionController.getInteractionDetails);
router.get('/:id', validateInteractionId, interactionController.getInteractionById);
router.post(
    '/',
    validateRequiredFields(interactionRequiredFields, 'Missing required interaction fields.'),
    validateUserIdBody,
    validateMode,
    validateInteractionType,
    validateLevel,
    validateArrayField('wordGroup', 'Invalid word group.'),
    validateNumericBodyField('previousInteractionId', 'Invalid previous interaction id.'),
    isOwnerOrAdminByBodyUserId,
    interactionController.createInteraction
);
router.put(
    '/:id',
    validateInteractionId,
    validateUserIdBody,
    validateMode,
    validateInteractionType,
    validateLevel,
    validateArrayField('wordGroup', 'Invalid word group.'),
    validateNumericBodyField('previousInteractionId', 'Invalid previous interaction id.'),
    interactionController.updateInteraction
);
router.delete('/:id', validateInteractionId, interactionController.deleteInteraction);

module.exports = router;
