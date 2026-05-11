const express = require('express');
const router = express.Router();
const learningItemController = require('../controllers/learningItemController');
const { isAdmin } = require('../middleware/auth');

// ***
// --- GET /learning-items (Admin only) ---
router.get('/', isAdmin, learningItemController.getAllLearningItems);

// --- GET /learning-items/user/:userId ---
router.get('/user/:userId', learningItemController.getLearningItemsByUserId);

// --- GET /learning-items/:id ---
router.get('/:id', learningItemController.getLearningItemById);

// --- POST /learning-items ---
router.post('/', learningItemController.createLearningItem);

// --- PUT /learning-items/:id ---
router.put('/:id', learningItemController.updateLearningItem);

// --- DELETE /learning-items/:id ---
router.delete('/:id', learningItemController.deleteLearningItem);
// ***

module.exports = router;
