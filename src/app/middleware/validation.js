const sendValidationError = (res, message, details = {}) => {
    return res.status(400).json({
        success: false,
        data: null,
        error: {
            code: 'VALIDATION_ERROR',
            message,
            details
        }
    });
};

const validateNumericParam = (paramName, fieldName = paramName, message = `Invalid ${fieldName}.`) => {
    return (req, res, next) => {
        const value = parseInt(req.params[paramName]);

        if (Number.isNaN(value)) {
            return sendValidationError(res, message, { field: fieldName });
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
            return sendValidationError(res, message, { missingFields });
        }

        next();
    };
};

const validateUserIdBody = (req, res, next) => {
    if (req.body.userId !== undefined && Number.isNaN(parseInt(req.body.userId))) {
        return sendValidationError(res, 'Invalid user id.', { field: 'userId' });
    }

    next();
};

const validateEnum = (field, allowedValues, message) => {
    return (req, res, next) => {
        if (req.body[field] && !allowedValues.includes(req.body[field])) {
            return sendValidationError(res, message, { field, allowedValues });
        }

        next();
    };
};

const validateArrayField = (field, message) => {
    return (req, res, next) => {
        if (req.body[field] !== undefined && !Array.isArray(req.body[field])) {
            return sendValidationError(res, message, { field, expectedType: 'array' });
        }

        next();
    };
};

const validateNumericBodyField = (field, message) => {
    return (req, res, next) => {
        if (req.body[field] !== undefined && req.body[field] !== null && Number.isNaN(parseInt(req.body[field]))) {
            return sendValidationError(res, message, { field });
        }

        next();
    };
};

module.exports = {
    validateNumericParam,
    validateRequiredFields,
    validateUserIdBody,
    validateEnum,
    validateArrayField,
    validateNumericBodyField
};
