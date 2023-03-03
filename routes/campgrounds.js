const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });



router.route('/')
        .get(catchAsync(campgrounds.main))
        .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.newForm);

router.route('/:id')
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
    .get(catchAsync(campgrounds.getCampground))
    .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground,  catchAsync(campgrounds.editCampground));




router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.editCampgroundForm));




module.exports = router;