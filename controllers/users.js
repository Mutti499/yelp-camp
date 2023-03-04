const User = require('../models/user');

const registerForm =  (req, res) => {
    res.render("users/register")
}

const register = async(req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username : username , email: email});
        const rUser = await User.register(user , password);


        req.login(rUser, (err) =>{ // when a new person register we should automatically login 
            if(err) return next(err);
            req.flash('success' , "New user created!")
            res.redirect('/campgrounds');
        })
    } catch (error) {
        req.flash('error' , error.message);
        res.redirect('/register');

    }

}

const loginForm = (req, res) => {
    res.render("users/login");
}

const login = async(req, res) => {
    req.flash('success' , "Welcome Back!")
    const redirectUrl = req.session.returnTo || "/campgrounds"; //normall passport version 0.6.0 is makin a new session and hence we lose our returnTo but I added 'keepSessionInfo : true' to keep it so I can use returnTo value from here
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

const logout =  (req, res) =>{
    if(req.isAuthenticated()){
        req.logout(function(err) {
            if (err) { return next(err); }
            req.flash('success', "Logged Out!");
            res.redirect('/campgrounds');
          });
    }
    else{
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/campgrounds');
          });
    }
}

module.exports = {
    registerForm,
    register,
    loginForm,
    login,
    logout
}