//Validation helpers
const {
    check
} = require('express-validator')

exports.validateRegister = [
    check('name', 'Name is required').notEmpty().isLength({
        min: 4,
        max: 32
    }).withMessage('Name must be between 4 and 32 characters'),
    check('email').notEmpty().withMessage('Must be a valid email address'),
    check('password', 'Password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage('Password must contain a number')
]

exports.validateLogin = [
    check('email').notEmpty().isEmail().withMessage('Must be a valid email address'),
    check('password', 'Password is required').notEmpty()
]

exports.forgotPasswordValidator = [
    check('email').notEmpty().isEmail().withMessage('Must be a valid email address'),
]

exports.resetPasswordValidator = [
    check('newPassword')
    .notEmpty().isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage('Password must contain a number')
]