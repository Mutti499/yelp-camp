const { campgroundSchema, reviewSchema, passwordSchema, registerSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in first for this")
        return res.redirect("/login");
    }
    next();
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash("error", "Item not found.");
        return res.redirect(`/campgrounds/${id}`);
    }
    
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}



const validateCampground = (req,res,next)=>{
    if(campgroundSchema.validate(req.body).error){ // if data is accurate there wont be a error property (there will be only value property)
        let errorResult = campgroundSchema.validate(req.body).error;
        //console.log(errorResult.details); it is an array so I need traverse all detail messages in this aray
        throw new ExpressError(errorResult.details.map(object => object.message).join(","), 400);
    }
    else{
        next();
    }
}


const validateReview = (req, res, next) => {
    if(reviewSchema.validate(req.body).error){ 
        let errorResult = reviewSchema.validate(req.body).error;
        throw new ExpressError(errorResult.details.map(object => object.message).join(","), 400);
    }
    else{
        next();
    }
}

const isReviewAuthor = async (req, res, next) => {
    const { id, rewID } = req.params;
    const review = await Review.findById(rewID);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const validatePassword = async (req, res, next) => {
    const {id , token } = req.params;
    if(passwordSchema.validate(req.body).error){ 
        let errorResult = passwordSchema.validate(req.body).error;
        let errorMessage = errorResult.details.map(object => object.message).join(",")
        req.flash('error' , errorMessage);
        return res.redirect(`/reset-password/${id}/${token}`)
    }
    else{
        next();
    }

}

const validateRegister = async (req, res, next) => {
    if(registerSchema.validate(req.body).error){ 
        let errorResult = registerSchema.validate(req.body).error;
        let errorMessage = errorResult.details.map(object => object.message).join(",")
        req.flash('error' , errorMessage);
        return res.redirect(`/register`)
    }
    else{
        next();
    }
}

module.exports = {isLoggedIn, isAuthor, validateCampground, validateReview, isReviewAuthor, validatePassword, validateRegister};
