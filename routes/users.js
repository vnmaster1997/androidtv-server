const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require('../middleware/auth');

const multer = require('multer');
const imageUploader = multer({ dest: 'assets/' });

const User = require("../models/user");
const controllers = require('../controllers/userController');
/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
    "/signup", [
        check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    controllers.signUp
);

router.post(
    "/login", [
        check("username", "Please enter a valid username").not().isEmpty(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    controllers.authLogin
);

router.post(
    "/refreshToken",
    controllers.getNewToken
)

/* GET users listing. */
router.get('/all', function(req, res, next) {
    User.find({}, function(err, users) {
        if (err) throw err;
        res.send(users)
    })
});

router.get('/me', auth, controllers.getUserLogin)

router.post('/avatar', auth, imageUploader.single('avatar'), controllers.uploadAvatar)

router.get('/avatar/:name', controllers.getAvatar)

router.post('/changepassword', auth, controllers.changePassword)

router.get(
    'logout',
    controllers.logOut
);

module.exports = router;