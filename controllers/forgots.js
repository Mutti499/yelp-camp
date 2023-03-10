const User = require('../models/user');
var nodemailer = require('nodemailer');// added for sending password reset tokens
var jwt = require('jsonwebtoken');//added for password resets


const main = async(req,res) => {
    res.render("users/forgot");
}

const tokenSend = async (req,res) => {
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
        req.flash('error' , "You probably regşstered with a mail which is not valid or email sending process is broken. Please report that problem to admin!");
        return res.redirect("/forgot");
      } else {
        req.flash('success' , `Email sent to ${user.email}`);
        return res.redirect("/forgot")
      }
    });
  
}




module.exports = {
    main,
    tokenSend
}