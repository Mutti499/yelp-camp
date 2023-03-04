const User = require('../models/user');


const changePageLoader = async(req,res) =>{
    const user = await User.findById(req.params.id);
    if(req.user.id != req.params.id){
      req.flash("error", "You are not authorized to see this page");
      return res.redirect("/campgrounds");
    }
    res.render('users/passwordChange', { user })
  }



  const passwordChange =  async(req,res) =>{
    const userById = await User.findById(req.params.id);
    if(req.user.id != req.params.id){
      req.flash("error", "You are not authorized to send this request!");
      return res.redirect("/campgrounds");
    }
  
    User.findByUsername(userById.username, (err, user) => {
      if (err) {
        req.flash("error", "Finding user process failed");
        return res.redirect(`/change-password/${req.params.id}`);
      } else {
          user.changePassword(req.body.oldPassword, req.body.password1, function (err) {
              if (err) {
                req.flash("error", "Current password is incorrect (or password changing process failed)");
                return res.redirect(`/change-password/${req.params.id}`);
              } else {
                req.flash("success", "Password changed!");
                return res.redirect("/campgrounds");
              }
          });
      }
  });
  }


  module.exports = {
    changePageLoader,
    passwordChange
}