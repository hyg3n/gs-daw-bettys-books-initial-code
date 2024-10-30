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


router.post("/loggedin", function (req, res, next) {
  const username = req.body.username;
  const plainPassword = req.body.password;
  let sqlquery = "SELECT * FROM users WHERE username = ?";

  db.query(sqlquery, [username], (err, result) => {
      if (err) {
          return next(err);
      }
      if (result.length === 0) {
          return res.send("User not found. Please check your username.");
      }
      const user = result[0];
      bcrypt.compare(plainPassword, user.hashedPassword, (err, match) => {
          if (err) {
              return next(err);
          }
          if (match) {
              req.session.userId = req.body.username;
              res.send("Login successful! Welcome back, " + user.first_name + "!");
          } else {
              res.send("Incorrect password. Please try again.");
          }
      });
  });
});

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
    // Sanitize input fields to prevent XSS
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

// Login route
router.get("/login", function (req, res, next) {
  res.render("login.ejs"); // Render the login view
});

router.post("/login", function (req, res, next) {
  const username = req.body.username;
  const plainPassword = req.body.password;
  let sqlquery = "SELECT * FROM users WHERE username = ?";

  db.query(sqlquery, [username], (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.length === 0) {
      return res.send("User not found. Please check your username.");
    }
    const user = result[0];

    bcrypt.compare(plainPassword, user.hashedPassword, (err, match) => {
      if (err) {
        return next(err);
      }

      if (match) {
        req.session.userId = req.body.username;
        res.send("Login successful! Welcome back, " + user.first_name + "!");
      } else {
        res.send("Incorrect password. Please try again.");
      }
    });
  });
});

// User listing route
router.get("/listusers", redirectLogin, function (req, res, next) {
  let sqlquery = "SELECT username, first_name, last_name, email FROM users";
  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("listusers.ejs", { users: result });
  });
});

// Register page route
router.get("/register", function (req, res, next) {
  res.render("register.ejs");
});

// Export the router object and the redirectLogin middleware
module.exports = { router: router, redirectLogin };
