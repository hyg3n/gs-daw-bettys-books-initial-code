// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.get("/register", function (req, res, next) {
  res.render("register.ejs");
});

router.get('/login', function(req, res, next) {
  res.render("login.ejs"); // Render the login view
});


router.post('/loggedin', function (req, res, next) {
  const username = req.body.username;
  const plainPassword = req.body.password;

  // Query the database to find the user by username
  let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";
  
  db.query(sqlquery, [username], (err, result) => {
    if (err) {
      return next(err);  // Handle any database errors
    }

    if (result.length === 0) {
      // If no user found with the given username
      res.send("Login failed: Username not found.");
    } else {
      const hashedPassword = result[0].hashedPassword;

      // Compare the password supplied with the hashed password in the database
      bcrypt.compare(plainPassword, hashedPassword, function (err, comparisonResult) {
        if (err) {
          return next(err);  // Handle any bcrypt errors
        }
        
        if (comparisonResult === true) {
          // If the passwords match, login is successful
          res.send("Login successful! Welcome back, " + username + ".");
        } else {
          // If the passwords do not match
          res.send("Login failed: Incorrect password.");
        }
      });
    }
  });
});


router.post('/login', function(req, res, next) {
  const username = req.body.username;
  const plainPassword = req.body.password;

  // Query to find user by username
  let sqlquery = "SELECT * FROM users WHERE username = ?";
  
  // Execute SQL query to find the user
  db.query(sqlquery, [username], (err, result) => {
      if (err) {
          return next(err); // Handle database error
      }

      if (result.length === 0) {
          // User not found
          return res.send("User not found. Please check your username.");
      }

      const user = result[0];

      // Compare the entered password with the stored hashed password
      bcrypt.compare(plainPassword, user.hashedPassword, (err, match) => {
          if (err) {
              return next(err); // Handle error during comparison
          }

          if (match) {
              // Passwords match, login successful
              res.send("Login successful! Welcome " + user.first_name + "!");
          } else {
              // Passwords do not match
              res.send("Incorrect password. Please try again.");
          }
      });
  });
});

router.get('/listusers', function(req, res, next) {
    let sqlquery = "SELECT username, first_name, last_name, email FROM users"; // Exclude hashedPassword
    // Execute SQL query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err); 
        }
        res.render("listusers.ejs", { users: result }); 
    });
});

router.post("/registered", function (req, res, next) {
  const plainPassword = req.body.password;

  bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
    // Store hashed password in your database.

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

      let resultMessage =
        "Hello " +
        req.body.first +
        " " +
        req.body.last +
        ", you are now registered! We will send an email to you at " +
        req.body.email;
      resultMessage +=
        " Your password is: " +
        req.body.password +
        " and your hashed password is: " +
        hashedPassword;

      // Send the response
      res.send(resultMessage);
    });
  });
});

// Export the router object so index.js can access it
module.exports = router;
