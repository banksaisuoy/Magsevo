const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const isHttpUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const videoValidationRules = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('description')
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    body().custom((_, { req }) => {
        const url = req.body.videoUrl ?? req.body.url;
        if (!url || typeof url !== 'string' || !isHttpUrl(url.trim())) {
            throw new Error('Video URL must be a valid HTTP(S) URL');
        }
        return true;
    }),
    body('categoryId')
        .notEmpty()
        .withMessage('Category is required')
        .isInt({ min: 1 })
        .withMessage('Category must be a valid ID'),
];

const validateVideoIdRule = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid video ID'),
];

const validateVideoId = [
    ...validateVideoIdRule,
    handleValidationErrors,
];

const validateVideoCreate = [
    ...videoValidationRules,
    handleValidationErrors,
];

const validateVideoUpdate = [
    ...validateVideoIdRule,
    ...videoValidationRules,
    handleValidationErrors,
];

module.exports = {
    validateVideoId,
    validateVideoCreate,
    validateVideoUpdate,
};
