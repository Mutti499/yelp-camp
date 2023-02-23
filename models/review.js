const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    rate: Number,
    comment : String,
    author: {
        type: Schema.Types.ObjectID,
        ref:"User"
    }
})

module.exports =  mongoose.model("Review", reviewSchema);
