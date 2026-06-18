const { Admin, User } = require('../../models');
const { sendError, sendSuccess } = require('../utils/responses');
const { sanitizeUser } = require('../utils/sanitize');

const serializeAdmin = admin => {
    const plainAdmin = typeof admin.get === 'function' ? admin.get({ plain: true }) : admin;

    if (!plainAdmin.user) {
        return plainAdmin;
    }

    return {
        ...plainAdmin,
        user: sanitizeUser(plainAdmin.user)
    };
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            include: [{ model: User, as: 'user' }],
            order: [['adminId', 'ASC']]
        });

        return sendSuccess(res, 200, admins.map(serializeAdmin));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get admins.');
    }
};

const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!admin) {
            return sendError(res, 404, 'ADMIN_NOT_FOUND', 'Admin not found.');
        }

        return sendSuccess(res, 200, serializeAdmin(admin));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get admin.');
    }
};

const createAdmin = async (req, res) => {
    try {
        const { userId, permissionsLevel } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
        }

        user.userRole = 'admin';
        await user.save();

        const admin = await Admin.create({
            userId,
            permissionsLevel: permissionsLevel || 'full_access'
        });

        return sendSuccess(res, 201, admin);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendError(res, 400, 'ADMIN_EXISTS', 'Admin profile already exists for this user.');
        }

        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not create admin.');
    }
};

const updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);
        if (!admin) {
            return sendError(res, 404, 'ADMIN_NOT_FOUND', 'Admin not found.');
        }

        if (req.body.permissionsLevel !== undefined) {
            admin.permissionsLevel = req.body.permissionsLevel;
        }

        await admin.save();
        return sendSuccess(res, 200, admin);
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not update admin.');
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);
        if (!admin) {
            return sendError(res, 404, 'ADMIN_NOT_FOUND', 'Admin not found.');
        }

        await admin.destroy();
        return sendSuccess(res, 200, { adminId: req.params.id, message: 'Admin deleted successfully.' });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete admin.');
    }
};

module.exports = {
    createAdmin,
    deleteAdmin,
    getAdminById,
    getAllAdmins,
    updateAdmin
};
