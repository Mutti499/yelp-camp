const User = require('../models/user');
var jwt = require('jsonwebtoken');//added for password resets


const resetPageLoader = async (req,res) => {
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
  
  }


const passwordReset =  async (req,res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user){
      req.flash('error' , "Invalid ID");
      return res.redirect("/login");
    } 
    user.passwordChanged = true;
    await user.setPassword(req.body.password);
    await user.save();
    req.flash('success' , "Password Changed!");
    return res.redirect("/login");
}


module.exports = {
    resetPageLoader,
    passwordReset
}