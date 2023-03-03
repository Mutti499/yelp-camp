const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require("../controllers/users")
const { validateRegister } = require('../middleware.js');

router.route("/register")
        .get(users.registerForm)
        .post(validateRegister, catchAsync(users.register))

router.route("/login")
        .get(users.loginForm)
        .post(passport.authenticate('local'/* we can add facebook twitter to here */, { failureFlash: true, failureRedirect: '/login', failureMessage: true, keepSessionInfo: true }), catchAsync(users.login));


router.get('/logout',users.logout)

module.exports = router;
