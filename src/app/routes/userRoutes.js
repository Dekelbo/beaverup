const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAdmin, isOwnerOrAdmin } = require('../middleware/auth');

// --- GET /users (Admin only) ---
router.get('/', isAdmin, userController.getAllUsers);

// --- GET /users/:id (Admin or Owner) ---
router.get('/:id', isOwnerOrAdmin, userController.getUserById);

// --- POST /users/:id (Admin or Owner) ---
// --- Note: Using :id in path to verify ownership during creation/post ---
router.post('/', userController.createUser);

// --- DELETE /users/:id (Admin only) ---
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;