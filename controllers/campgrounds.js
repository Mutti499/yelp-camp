const Campground = require('../models/campground');
const cloudinary = require('cloudinary').v2;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const campground = require('../models/campground');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const main = async(req,res) => {
    const campgrounds = await Campground.find({});
    res.render("campground/campgrounds" , {campgrounds})
}

const newForm = async(req, res) =>{
    res.render("campground/new")
}

const createCampground = async(req,res)=>{
    const { country, city, detail} = req.body.campground
    const queryString = country + " " + city + " " + detail
    const geoData = await geocoder.forwardGeocode({
        query: queryString,
        limit: 1
    }).send()
    const camp = new Campground(req.body.campground);
    camp.geometry = geoData.body.features[0].geometry;
    camp.image = req.files.map(f => ({url : f.path, filename: f.filename}))
    camp.author = req.user._id;
    let date = new Date();// Added current date when the posts are created
    camp.date = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
    await camp.save();
    req.flash("success" , "Campground has been made!!")
    res.redirect(`/campgrounds/${camp._id}`)
}


const editCampgroundForm = async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campground/edit", {camp} );
}


const getCampground = async (req, res) => {
    const {id} = req.params;                            //at the below line first populate argument is extended in order to show both reviews and author of the same review at the same time
    const camp = await Campground.findById(id).populate({path: 'reviews', populate:{path: "author"}}).populate("author");
    if(!camp){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campground/show", {camp} );
}

const editCampground = async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body.campground);
    const images = req.files.map(f => ({url : f.path, filename: f.filename}))
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); // deleting images from cloudinary system
        }
        await camp.updateOne({$pull : { image : { filename :{ $in: req.body.deleteImages }} }})// deleting images from camp property
    }
    camp.image.push(...images);
    await camp.save();
    req.flash("success" , "Campground has been updated")
    res.redirect(`/campgrounds/${camp._id}` );

}

const deleteCampground = async (req, res) => {
    
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success" , "Campground has been deleted")
    res.redirect("/campgrounds")
}

module.exports = {
    main, 
    newForm, 
    createCampground, 
    editCampground,
    getCampground,
    editCampgroundForm,
    deleteCampground
}