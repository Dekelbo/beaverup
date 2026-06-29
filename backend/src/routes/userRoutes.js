const express = require('express');
const userController = require('../controllers/userController');
const { isAdmin, isAdminOrManager, isAdminOrManagerOrOwnerByIdParam, isOwnerOrAdmin } = require('../middleware/auth');
const { validateEnum, validateNumericParam, validateRequiredFields } = require('../middleware/validation');
const { LEVEL_VALUES } = require('../utils/levels');

const router = express.Router();

const userRequiredFields = [
    'firstName',
    'lastName',
    'userRole',
    'userNativeLanguage',
    'languageToLearn',
    'currentLevel'
];
const validateUserRole = validateEnum('userRole', ['admin', 'manager', 'user'], 'Invalid user role.');
const validateCurrentLevel = validateEnum('currentLevel', LEVEL_VALUES, 'Invalid current level.');
const validateUserId = validateNumericParam('id', 'id', 'Invalid user id.');

router.get('/', isAdminOrManager, userController.getAllUsers);
router.get('/:id/summary', validateUserId, isOwnerOrAdmin, userController.getUserSummary);
router.get('/:id/with-interactions', validateUserId, isOwnerOrAdmin, userController.getUserWithInteractions);
router.get('/:id/with-learning-items', validateUserId, isOwnerOrAdmin, userController.getUserWithLearningItems);
router.get('/:id', validateUserId, isOwnerOrAdmin, userController.getUserById);
router.post(
    '/',
    validateRequiredFields(userRequiredFields, 'Missing required user fields.'),
    validateUserRole,
    validateCurrentLevel,
    userController.createUser
);
router.put('/:id', validateUserId, isAdminOrManagerOrOwnerByIdParam, validateUserRole, validateCurrentLevel, userController.updateUser);
router.delete('/:id', validateUserId, isAdmin, userController.deleteUser);

module.exports = router;
