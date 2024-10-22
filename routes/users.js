const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { check, validationResult } = require("express-validator");

// Middleware to check login
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/users/login");
  } else {
    next();
  }
};

// Registration route with validation and sanitization
router.post(
  "/registered",
  [
    check("email").isEmail().withMessage("Must be a valid email address"),
    check("username").notEmpty().withMessage("Username is required"),
    check("first").notEmpty().withMessage("First name is required"),
    check("last").notEmpty().withMessage("Last name is required"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  function (req, res, next) {
    // Sanitize all input fields to prevent XSS
    req.body.first = req.sanitize(req.body.first);
    req.body.last = req.sanitize(req.body.last);
    req.body.username = req.sanitize(req.body.username);
    req.body.email = req.sanitize(req.body.email);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const plainPassword = req.body.password;

      bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) {
          return next(err);
        }

        let sqlquery =
          "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
        let newUser = [
          req.body.username,
          req.body.first,
          req.body.last,
          req.body.email,
          hashedPassword,
        ];

        db.query(sqlquery, newUser, (err, result) => {
          if (err) {
            return next(err);
          }

          let resultMessage = `Hello ${req.body.first} ${req.body.last}, you are now registered! We will send an email to you at ${req.body.email}`;
          res.send(resultMessage);
        });
      });
    }
  }
);

// Export the router object so index.js can access it
module.exports = { router: router, redirectLogin };
