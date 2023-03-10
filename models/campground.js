const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
const Review = require("./review")
const cloudinary = require('cloudinary').v2;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    date: String,
    title: String,
    image: [ImageSchema],
    price: Number,
    description: String,
    city: String,
    country: String,
    detail: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref:'User',        
    },
    reviews: [ 
    {
        type: Schema.Types.ObjectId,
        ref:'Review',
    }],
    
}, opts);


campgroundSchema.virtual('properties.popUp').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

campgroundSchema.post("findOneAndDelete", async function(data){ // findByIdAndDelete function triggers findOneAndDelete middleware so we put letter function as parameter
    if (data.reviews) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }
    if (data.image){
        for (let filename of data.image) {
            await cloudinary.uploader.destroy(filename.filename); // deleting images from cloudinary system
        }
    }

})


module.exports = mongoose.model("Campground", campgroundSchema);