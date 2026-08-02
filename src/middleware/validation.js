
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateCategoryExists = async (value, { req }) => {
    const db = req.app.get('db');
];

const validateVideoCreate = [
    ...videoValidationRules,
    handleValidationErrors
];

const validateVideoUpdate = [
    ...validateVideoIdRule,
    ...videoValidationRules,
    handleValidationErrors
];

module.exports = {
    validateVideoId,
    validateVideoCreate,
    validateVideoUpdate
};