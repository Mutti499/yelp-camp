const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    avatarSrc: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordChanged: { 
        type: Boolean,
        default: false },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);