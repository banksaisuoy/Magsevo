const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateCategoryExists = async (value, { req }) => {
    const db = req.app.get('db');
    // Request mentions "category: required, string, must exist in the categories table"
    
    if (!db) {
        throw new Error('Database connection not available');
    }

    // Try finding by name or ID
    let category;
    if (!isNaN(value)) {
        category = await db.get('SELECT id FROM categories WHERE id = ? OR name = ?', [value, value]);
    } else {
        category = await db.get('SELECT id FROM categories WHERE name = ?', [value]);
    }
    
    if (!category) {
        throw new Error('Category does not exist');
    }
    
    // For convenience in the route, we could assign the category_id if needed, but validation just needs to pass
    
    return true;
};

const videoValidationRules = [
    body('title')
        .exists()
        .withMessage('Title is required')
        .isString()
        .withMessage('Title must be a string')
        .isLength({ max: 255 })
        .withMessage('Title cannot exceed 255 characters')
        .escape(),
    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .escape(),
    body('category')
        .exists()
        .withMessage('Category is required')
        .isString()
        .withMessage('Category must be a string')
        .custom(validateCategoryExists),
    body('tags')
        .optional({ nullable: true, checkFalsy: true })
        .isArray()
        .withMessage('Tags must be an array of strings'),
    body('tags.*')
        .isString()
        .withMessage('Each tag must be a string')
        .isLength({ max: 50 })
        .withMessage('Each tag cannot exceed 50 characters')
        .escape()
];

const validateVideoCreate = [
    ...videoValidationRules,
    handleValidationErrors
];

const validateVideoUpdate = [
    ...videoValidationRules,
    handleValidationErrors
];

module.exports = {
    validateVideoCreate,
    validateVideoUpdate
};