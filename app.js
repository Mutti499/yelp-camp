if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const { passwordSchema } = require('./schemas.js');

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
var jwt = require('jsonwebtoken');//added for password resets
var nodemailer = require('nodemailer');// added for sending password reset tokens

const MongoStore = require('connect-mongo')(session);


mongoose.set('strictQuery', false);

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


const dbURL = 'mongodb://127.0.0.1:27017/CAMP'|| process.env.DB_URL || 'mongodb://127.0.0.1:27017/CAMP'
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
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)



app.get('/', (req,res)=>{
    res.render('home')
})


app.get("/forgot", async(req,res) => {
  res.render("users/forgot");
})

app.post("/forgot", async (req,res) => {
  const { email } = req.body;
  const user = await User.findOne({email : email})

  if(!user) {
    req.flash('error' , "This email is not registered to the system");
    return res.redirect('/forgot');
  }
  
  const payload ={
    email: user.email,
    id: user.id
  }
  const secret = process.env.JWT_SECRET + user.id
  const token = jwt.sign(payload, secret, {expiresIn:"15m"});
  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
  user.passwordChanged = false;
  await user.save();

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GUSER,
      pass: process.env.GPASSWORD
    }
  });


  var mailOptions = {
    from:  process.env.GUSER,
    to: user.email,
    subject: 'Instructions for password reset from YelpCamp!',
    text:"Hello " + user.username + ",\n \n" +
    "Somebody requested a new password for the YelpCamp account associated with " + user.email + ".\n \n" +
    "No changes have been made to your account yet. \n \n" +
    "You can reset your password by clicking the link below:\n" +
    link + "\n \n" +
    "If you did not request a new password, please let us know immediately by replying to this email.\n \n" +
    "Yours, \n" +
    "Mutti"
  };



  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      req.flash('error' , "Email sending process is broken. Please report that problem to admin!");
      return res.redirect("/forgot");
    } else {
      req.flash('success' , `Email sent to ${user.email}`);
      return res.redirect("/forgot")
    }
  });

})


app.get("/reset-password/:id/:token", async (req,res) => {
  const {id , token } = req.params;
  const user = await User.findById(id);


  if(!user){
    req.flash('error' , "Invalid ID");
    return res.redirect("/login");
  } else if(user.passwordChanged){
    req.flash('error' , "Invalid ID");
    return res.redirect("/login");
  } 

  const secret = process.env.JWT_SECRET + user.id;

  try {
    jwt.verify(token, secret);

    return res.render("users/passwordReset", {token: token, user });
  } catch (error) {
    req.flash('error' , "Invalid token!");
    return res.redirect("/login");
  }

})

app.post("/reset-password/:id/:token", async (req,res) => {
  const {id , token } = req.params;
  const user = await User.findById(id);
  if(!user){
    req.flash('error' , "Invalid ID");
    return res.redirect("/login");
  } 

  if(passwordSchema.validate(req.body).error){ 
    let errorResult = passwordSchema.validate(req.body).error;
    let errorMessage = errorResult.details.map(object => object.message).join(",")
    req.flash('error' , errorMessage);
    return res.redirect(`/reset-password/${user.id}/${token}`)

  }
  else{
    user.passwordChanged = true;

    await user.setPassword(req.body.password);
    await user.save();
    req.flash('success' , "Password Changed!");
    return res.redirect("/login");
}

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