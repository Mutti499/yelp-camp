const express = require('express');
const router = express.Router({mergeParams: true}); // we need to merge them because normally link will not include the :id part
const catchAsync = require('../utils/catchAsync');
const changes = require('../controllers/changes');
const { validatePassword2 } = require('../middleware.js');


router.get("/:id", catchAsync(changes.changePageLoader))


router.post("/:id", validatePassword2, catchAsync(changes.passwordChange))



module.exports = router;