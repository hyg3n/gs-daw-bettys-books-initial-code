const express = require("express");
const router = express.Router();
const { redirectLogin } = require("./users");

// Home page route
router.get("/", function (req, res, next) {
  res.render("index.ejs");
});

// About page route
router.get("/about", function (req, res, next) {
  res.render("about.ejs");
});

// Logout route with session destruction
router.get("/logout", redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("./");
    }
    res.send('You are now logged out. <a href="./">Home</a>');
  });
});

// Export the router object so index.js can access it
module.exports = router;
