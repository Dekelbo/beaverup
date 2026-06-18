const { sendError } = require('../utils/responses');

const validateNumericParam = (paramName, fieldName = paramName, message = `Invalid ${fieldName}.`) => {
    return (req, res, next) => {
        const value = parseInt(req.params[paramName], 10);

        if (Number.isNaN(value)) {
            return sendError(res, 400, 'VALIDATION_ERROR', message, { field: fieldName });
        }

        req.params[paramName] = value;
        next();
    };
};

const validateRequiredFields = (fields, message) => {
    return (req, res, next) => {
        const missingFields = fields.filter(
            field => req.body[field] === undefined || req.body[field] === '' || req.body[field] === null
        );

        if (missingFields.length > 0) {
            return sendError(res, 400, 'VALIDATION_ERROR', message, { missingFields });
        }

        next();
    };
};

const validateUserIdBody = (req, res, next) => {
    if (req.body.userId !== undefined && Number.isNaN(parseInt(req.body.userId, 10))) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', { field: 'userId' });
    }

    next();
};

const validateEnum = (field, allowedValues, message) => {
    return (req, res, next) => {
        if (req.body[field] && !allowedValues.includes(req.body[field])) {
            return sendError(res, 400, 'VALIDATION_ERROR', message, { field, allowedValues });
        }

        next();
    };
};

const validateArrayField = (field, message) => {
    return (req, res, next) => {
        if (req.body[field] !== undefined && !Array.isArray(req.body[field])) {
            return sendError(res, 400, 'VALIDATION_ERROR', message, { field, expectedType: 'array' });
        }

        next();
    };
};

const validateNumericBodyField = (field, message) => {
    return (req, res, next) => {
        if (req.body[field] !== undefined && req.body[field] !== null && Number.isNaN(parseInt(req.body[field], 10))) {
            return sendError(res, 400, 'VALIDATION_ERROR', message, { field });
        }

        next();
    };
};

module.exports = {
    validateArrayField,
    validateEnum,
    validateNumericBodyField,
    validateNumericParam,
    validateRequiredFields,
    validateUserIdBody
};
