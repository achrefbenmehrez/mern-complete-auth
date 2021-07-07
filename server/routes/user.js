const express = require('express');
const router = express.Router();

const {
    validateRegister,
    validateLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../helpers/validate')

const {
    registerController,
    activationController,
    loginController,
    forgotController,
    resetController,
    googleController,
    facebookController,
    requireSignin,
    adminMiddleware,
    readController,
    updateController
} = require('../controllers/user.js')

router.post('/register', validateRegister, registerController);
router.post('/login', validateLogin, loginController);
router.post('/activation', activationController);
router.post('/forgot-password', forgotPasswordValidator, forgotController);
router.patch('/reset-password', resetPasswordValidator, resetController);
router.post('/google-login', googleController);
router.post('/facebook-login', facebookController);

router.get('/:id', requireSignin, readController);
router.put('/update', requireSignin, updateController);
router.put('/admin/update', requireSignin, adminMiddleware, updateController);

module.exports = router;