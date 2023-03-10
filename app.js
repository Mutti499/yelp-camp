if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require("connect-flash");
var methodOverride = require('method-override')
const ExpressError = require("./utils/ExpressError");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize'); // its required in order to prevent sql injection kind attacks
const helmet = require("helmet");// it helps about securing the site far better

const MongoStore = require('connect-mongo')(session);


mongoose.set('strictQuery', false);

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const forgotRoutes = require('./routes/forgot');
const resetRoutes = require('./routes/reset');
const changeRoutes = require('./routes/change');


const dbURL =  process.env.DB_URL || 'mongodb://127.0.0.1:27017/CAMP'
mongoose.connect(dbURL, {
    useNewUrlParser : true,
    useUnifiedTopology: true
})

mongoose.connection.on("error", console.error.bind(console, "connecttion error" ))
mongoose.connection.once("open", ()=>{console.log("Databese Connected")})
 
app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views"));
app.set("view engine","ejs");

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public"))); // this is really important i can reach public from ejs files. look at src's of the links such as favicon in boilerplate.ejs
app.use(mongoSanitize());


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoStore({
    url: dbURL,
    secret,
    touchAfter: 24 * 60 * 60// We dont want to update database constantly so we add once per 24 hour update option
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store: store,
    name: "session",// we give different name to cookie in order to hide it that it is for session id
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // added to increase security
        //secure : true, // with this code our cookie is only works in https sites makes it much more secure
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Equals to one week(type: milisecond)
        maxAge: 1000 * 60 * 60 * 24 * 7// 1 week later informations about logging in will be deleted
    }
}


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://ajax.googleapis.com"
  ];
  const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/", // I had to add this item to the array
  ];
  const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
  ];
  const fontSrcUrls = [];
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/duwga9whh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    })
  );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
    res.locals.user = req.user; // it gives information about currently logged in user. If there is not it gives undefined 
    res.locals.success= req.flash("success"); 
    res.locals.error = req.flash("error");
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/forgot', forgotRoutes);
app.use('/reset-password', resetRoutes);
app.use("/change-password", changeRoutes)


app.get('/', (req,res)=>{
    res.render('home')
})



app.get('/users/:id', async (req,res) => {

  try {
    const user = await User.findById(req.params.id);
    if(!user){
      req.flash("error", "User not found!")
      res.redirect("/campgrounds");
    }
  } catch (error) {
    req.flash("error", "User not found!")
    res.redirect("/campgrounds");

  }

  res.render('users/profile');
})




app.all("*", (req,res,next) =>{
    next(new ExpressError("This Page is Not Found!", 404));
});

app.use((err,req,res,next) =>{
    const { message="Something Went Wrong!" , statusCode=500 } = err;
    res.status(statusCode).render("error", {err} )
    //res.status(statusCode).render("error", {message , statusCode} ) if you want to use statuscode even when It does not exist
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})