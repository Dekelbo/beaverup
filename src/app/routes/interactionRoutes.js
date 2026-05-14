const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { isAdmin } = require('../middleware/auth');

// --- GET /interactions (Admin only) ---
router.get('/', isAdmin, interactionController.getAllInteractions);

// --- GET /interactions/user/:userId ---
router.get('/user/:userId', interactionController.getInteractionsByUserId);

// --- GET /interactions/:id ---
router.get('/:id', interactionController.getInteractionById);

// --- POST /interactions ---
router.post('/', interactionController.createInteraction);

// --- PUT /interactions/:id ---
router.put('/:id', interactionController.updateInteraction);

// --- DELETE /interactions/:id ---
router.delete('/:id', interactionController.deleteInteraction);

module.exports = router;
