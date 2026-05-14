const express = require('express');
const router = express.Router();
const interactions = require('../models/interactions');
const interactionController = require('../controllers/interactionController');
const { isAdmin, isOwnerOrAdminByUserParam, isOwnerOrAdminByBodyUserId, isOwnerOrAdminForResource } = require('../middleware/auth');
const { validateNumericParam, validateRequiredFields, validateUserIdBody, validateEnum, validateArrayField, validateNumericBodyField } = require('../middleware/validation');

const interactionRequiredFields = ['userId', 'mode', 'language', 'level'];
const validateInteractionId = validateNumericParam('id', 'id', 'Invalid interaction id.');
const validateUserIdParam = validateNumericParam('userId', 'userId', 'Invalid user id.');
const validateMode = validateEnum('mode', ['conversation', 'story', 'translate'], 'Invalid interaction mode.');
const validateInteractionType = validateEnum('interactionType', ['conversation_turn', 'story_start', 'story_followup', 'translate_request'], 'Invalid interaction type.');
const validateLevel = validateEnum('level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 'Invalid level.');
const isInteractionOwnerOrAdmin = isOwnerOrAdminForResource(interactions, 'interactionId', 'userId');

// --- GET /interactions (Admin only) ---
router.get('/', isAdmin, interactionController.getAllInteractions);

// --- GET /interactions/user/:userId ---
router.get('/user/:userId', validateUserIdParam, isOwnerOrAdminByUserParam, interactionController.getInteractionsByUserId);

// --- GET /interactions/:id ---
router.get('/:id', validateInteractionId, isInteractionOwnerOrAdmin, interactionController.getInteractionById);

// --- POST /interactions ---
router.post('/', validateRequiredFields(interactionRequiredFields, 'Missing required interaction fields.'), validateUserIdBody, validateMode, validateInteractionType, validateLevel, validateArrayField('wordGroup', 'Invalid word group.'), validateNumericBodyField('previousInteractionId', 'Invalid previous interaction id.'), isOwnerOrAdminByBodyUserId, interactionController.createInteraction);

// --- PUT /interactions/:id ---
router.put('/:id', validateInteractionId, validateUserIdBody, validateMode, validateInteractionType, validateLevel, validateArrayField('wordGroup', 'Invalid word group.'), validateNumericBodyField('previousInteractionId', 'Invalid previous interaction id.'), isInteractionOwnerOrAdmin, interactionController.updateInteraction);

// --- DELETE /interactions/:id ---
router.delete('/:id', validateInteractionId, isInteractionOwnerOrAdmin, interactionController.deleteInteraction);

module.exports = router;