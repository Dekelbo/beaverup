const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAdmin, isAdminOrManager, isAdminOrManagerOrOwnerByIdParam, isOwnerOrAdmin } = require('../middleware/auth');
const { validateNumericParam, validateRequiredFields, validateEnum } = require('../middleware/validation');

const userRequiredFields = [
    'firstName',
    'lastName',
    'userRole',
    'userNativeLanguage',
    'languageToLearn',
    'currentLevel'
];
const validateUserRole = validateEnum('userRole', ['admin', 'manager', 'user'], 'Invalid user role.');
const validateCurrentLevel = validateEnum(
    'currentLevel',
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    'Invalid current level.'
);
const validateUserId = validateNumericParam('id', 'id', 'Invalid user id.');

// --- GET /users (Admin or manager only) ---
router.get('/',isAdminOrManager, userController.getAllUsers);

// --- GET /users/:id (Admin or Owner) ---
router.get('/:id', validateUserId, isOwnerOrAdmin, userController.getUserById);

// --- POST /users ---
router.post(
    '/',
    validateRequiredFields(userRequiredFields, 'Missing required user fields.'),
    validateUserRole,
    validateCurrentLevel,
    userController.createUser
);

// --- PUT /users/:id (Admin or manager or Owner) ---
router.put('/:id', validateUserId, isAdminOrManagerOrOwnerByIdParam, validateUserRole, validateCurrentLevel, userController.updateUser);

// --- DELETE /users/:id (Admin only) ---
router.delete('/:id', validateUserId, isAdmin, userController.deleteUser);

module.exports = router;
