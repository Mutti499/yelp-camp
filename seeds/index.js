const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

mongoose.connect('mongodb://127.0.0.1:27017/CAMP', {
    useNewUrlParser : true,
    useUnifiedTopology: true
})

const Campground = require("../models/campground.js")
const {descriptors, places} = require("./seedHelpers");
const cities = require("./cities");



const maker = async () =>{
    await Campground.deleteMany({});
    
    for(let a = 0; a < 500 ; a++){
        let random2 =  Math.floor( Math.random() * 40) + 10;
        let random = Math.floor( Math.random() * 1000);
        let locationC =  `${cities[random].city } ${cities[random].state }`;

        let descriptor = descriptors[Math.floor(descriptors.length * Math.random())];
        let place = places[Math.floor(places.length * Math.random())]
        let camp = new Campground({
            title : `${ descriptor } ${ place }`,
            location: locationC,
            author: "63f3533e407ef6ccaf893ae3",
            description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti consectetur vitae impedit optio possimus natus enim quibusdam quia, esse fuga. Accusamus assumenda sit impedit ipsa, dolorum amet quos adipisci nostrum.",
            price : random2,
            geometry: { type: 'Point', coordinates: [cities[random].longitude, cities[random].latitude ] },
            image:[
                {
                    url: 'https://res.cloudinary.com/duwga9whh/image/upload/w_200/v1677005419/YelpCamp/bk1wogrhxjjaug0vjjiz.jpg',
                    filename: 'YelpCamp/xqclinzo5sj6ymjsjq3r',
                },
                {
                    url: 'https://res.cloudinary.com/duwga9whh/image/upload/w_200/v1677005419/YelpCamp/tpaw6ar9mxq4ewpmwcet.png',
                    filename: 'YelpCamp/tcgingyty2dld9z084nw',
                }
            ]
        })
        await camp.save();
    }
    console.log("Finished");
}

maker().then(() => {
    mongoose.connection.close();
});