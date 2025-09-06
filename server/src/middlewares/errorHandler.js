const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');
const { TokenExpiredError } = require('jsonwebtoken');
const CustomError = require('../utils/customError');

function errorHandler(error, req, res, next) {
    let message = `Something went wrong! ${error}`;
    let statusCode = error.statusCode || 500;
    let details = error.details;

    if (error instanceof CustomError) {
        message = error.message;
        statusCode = error.statusCode;
        details = error.details;
    } else if (error instanceof UniqueConstraintError) {
        const fieldErrors = error.errors.map((err) => ({
            field: err.path,
            value: err.value,
            message:
                err.path === 'slug'
                    ? 'This URL address is already taken'
                    : `${err.path.charAt(0).toUpperCase() + err.path.slice(1)} '${err.value}' is already taken.`,
        }));
        message = 'Unique constraint violation.';
        details = fieldErrors;
        statusCode = 409;
    } else if (error instanceof ForeignKeyConstraintError || error instanceof DatabaseError) {
        const dbError = dbErrors[error.original?.code];
        if (dbError) {
            message = dbError.message;
            statusCode = dbError.statusCode;
            details = error.message;
        }
    } else if (error instanceof ValidationError) {
        const validationErrors = error.errors.map((err) => ({
            message: err.message,
            path: err.path,
            value: err.value,
        }));
        message = 'Validation error(s)';
        details = validationErrors;
        statusCode = 400;
    } else if (error instanceof TokenExpiredError) {
        message = 'Your session has expired. Please log in again.';
        statusCode = 401;
    }

    console.log(`Error: ${req.method} >> ${req.baseUrl}${req.path} >> Message: ${message} >> Status Code: ${statusCode} >> Details:`, details);

    return res.status(statusCode).json({ message, statusCode, details });
}

const dbErrors = {
    23503: { message: 'Foreign key violation', statusCode: 409 },
    23502: { message: 'Not null violation', statusCode: 400 },
    23514: { message: 'Check violation', statusCode: 400 },
    22001: { message: 'String data right truncation', statusCode: 400 },
    22003: { message: 'Numeric value out of range', statusCode: 400 },
    42601: { message: 'Syntax error', statusCode: 400 },
    42883: { message: 'Undefined function', statusCode: 500 },
    42501: { message: 'Permission denied', statusCode: 403 },
    '22P02': { message: 'Invalid text representation', statusCode: 400 },
};

module.exports = errorHandler;
