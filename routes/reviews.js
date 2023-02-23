const express = require('express');
const router = express.Router({mergeParams: true}); // we need to merge them because normally link will not include the :id part

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware.js');

const Campground = require("../models/campground.js");
const Review = require("../models/review.js")
const reviews = require('../controllers/reviews');


router.delete("/:rewID",isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

router.post('/',isLoggedIn, validateReview, catchAsync(reviews.createReview));

module.exports = router;