const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

const validateCategoryExists = async (value, { req }) => {
    const db = req.app.get('db');
    if (!db) {
        throw new Error('Database connection not available');
    }
    let category;
    if (!isNaN(value)) {
        category = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM categories WHERE id = ? OR name = ?', [value, value], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    } else {
        category = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM categories WHERE name = ?', [value], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }
    
    if (!category) {
        throw new Error('Category does not exist');
    }
    
    return true;
};

const validateVideoIdRule = [
    param('id')
        .exists()
        .withMessage('Video ID is required')
        .isInt({ min: 1 })
        .withMessage('Video ID must be a positive integer')
        .toInt()
];

const videoValidationRules = [
    body('title')
        .exists()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .escape(),
    body('categoryId')
        .optional({ nullable: true, checkFalsy: true })
        .custom(validateCategoryExists),
    body('url')
        .optional({ nullable: true, checkFalsy: true })
        .isURL()
        .withMessage('Must be a valid URL')
];

const validateVideoId = [
    ...validateVideoIdRule,
    handleValidationErrors
];

const validateVideoCreate = [
];

module.exports = {
    validateVideoId,
    validateVideoCreate,
    validateVideoUpdate
};