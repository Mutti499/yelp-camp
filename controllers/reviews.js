const Review = require("../models/review.js")
const Campground = require("../models/campground.js");

const createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success" , "Your comment has been posted")
    res.redirect(`/campgrounds/${id}`);
}


const deleteReview = async (req, res) => {
    const{ id, rewID } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull : { reviews : rewID}})
    await Review.findByIdAndDelete(rewID);
    req.flash("success" , "Your comment has been deleted")

    res.redirect(`/campgrounds/${id}`)
}


module.exports = {
    createReview,
    deleteReview
}