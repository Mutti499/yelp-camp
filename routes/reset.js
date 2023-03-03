const express = require('express');
const router = express.Router({mergeParams: true}); // we need to merge them because normally link will not include the :id part
const catchAsync = require('../utils/catchAsync');
const resets = require('../controllers/resets');
const { validatePassword } = require('../middleware.js');


router.get("/:id/:token",catchAsync(resets.resetPageLoader))

router.post("/:id/:token", validatePassword, catchAsync(resets.passwordReset))



module.exports = router;