const express = require('express');
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');
const { validateNumericParam, validateRequiredFields } = require('../middleware/validation');

const router = express.Router();

const validateAdminId = validateNumericParam('id', 'id', 'Invalid admin id.');

router.get('/', isAdmin, adminController.getAllAdmins);
router.get('/:id', validateAdminId, isAdmin, adminController.getAdminById);
router.post('/', isAdmin, validateRequiredFields(['userId'], 'Missing required admin fields.'), adminController.createAdmin);
router.put('/:id', validateAdminId, isAdmin, adminController.updateAdmin);
router.delete('/:id', validateAdminId, isAdmin, adminController.deleteAdmin);

module.exports = router;
