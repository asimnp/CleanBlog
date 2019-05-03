const bcrypt = require("bcrypt");
const User = require("../database/models/User");

module.exports = (req, res) => {
  const { email, password } = req.body;

  // try to find user
  User.findOne({ email }, (error, user) => {
    if (user) {
      // compare password
      bcrypt.compare(password, user.password, (error, same) => {
        if (same) {
          req.session.userId = user._id;
          res.redirect("/");
        } else {
          res.redirect("/auth/login");
        }
      });
    } else {
      return res.redirect("/auth/login");
    }
  });
};
