const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { redirectLogin } = require("./users");

// Search route
router.get("/search", function (req, res, next) {
  res.render("search.ejs");
});

// Search result route with validation and sanitization
router.get(
  "/search_result",
  [check("search_text").notEmpty().withMessage("Search text cannot be empty")],
  redirectLogin,
  function (req, res, next) {
    req.query.search_text = req.sanitize(req.query.search_text); // Sanitize input

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let sqlquery =
      "SELECT * FROM books WHERE name LIKE '%" + req.query.search_text + "%'";
    db.query(sqlquery, (err, result) => {
      if (err) {
        return next(err);
      }
      res.render("list.ejs", { availableBooks: result });
    });
  }
);

// List books route
router.get("/list", redirectLogin, function (req, res, next) {
  let sqlquery = "SELECT * FROM books";
  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    }
    res.render("list.ejs", { availableBooks: result });
  });
});

// Add book form
router.get("/addbook", redirectLogin, function (req, res, next) {
  res.render("addbook.ejs");
});

// Book added route with validation and sanitization
router.post(
  "/bookadded",
  [
    check("name").notEmpty().withMessage("Book name is required"),
    check("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ],
  function (req, res, next) {
    req.body.name = req.sanitize(req.body.name); // Sanitize input
    req.body.price = req.sanitize(req.body.price);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        next(err);
      } else {
        res.send(
          "This book is added to the database, name: " +
            req.body.name +
            ", price: " +
            req.body.price
        );
      }
    });
  }
);

// Bargain books route
router.get("/bargainbooks", redirectLogin, function (req, res, next) {
  let sqlquery = "SELECT * FROM books WHERE price < 20";
  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    }
    res.render("bargains.ejs", { availableBooks: result });
  });
});

// Export the router object so index.js can access it
module.exports = router;
