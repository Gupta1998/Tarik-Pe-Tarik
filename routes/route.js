const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");
const { isLoggedIn, isLoggedOut } = require("../middleware/auth");

// show main page
router.get("/main", isLoggedIn, (req, res) => {
  res.render("main", { title: "Home" });
});

// show login page
router.get("/login", isLoggedOut, (req, res) => {
  const response = {
    title: "Login",
    error: req.query.error,
  };

  res.render("login", response);
});

// login form handler
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login?error=true" }),
  function (req, res) {
    res.redirect("/main");
  }
);

// logout
router.get("/logout", function (req, res, next) {
  req.logout((err) => {
    if (err) return next();
  });
  res.redirect("/main");
});

// Setup our admin user
router.get("/setup", async (req, res) => {
  const exists = await User.exists({ username: "admin" });

  if (exists) {
    res.redirect("/login");
    return;
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash("pass", salt, function (err, hash) {
      if (err) return next(err);

      const newAdmin = new User({
        username: "admin",
        password: hash,
      });

      newAdmin.save();

      res.redirect("/login");
    });
  });
});

// show add event page
router.get("/add", isLoggedIn, (req, res) => {
  res.render("main", { title: "Add Event" });
});

// get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ registrationDate: 1 });
    res.render("showEvents", { title: "Home", events });
  } catch (e) {
    res.send(e);
  }
});

// add event handler
router.post("/events", isLoggedIn, async (req, res) => {
  try {
    const { eligibility, mode, registrationDate, testDate } = req.body;
    if (!eligibility || !mode || !registrationDate || !testDate) {
      const event = new Event({
        ...req.body,
        eligibility: "NA",
        mode: "NA",
        registrationDate: new Date(0000, 00, 00),
        testDate: new Date(0000, 00, 00),
      });
      await event.save();
    } else {
      const event = new Event({
        ...req.body,
      });
      await event.save();
    }
    res.redirect("/add");
  } catch (e) {
    res.render("main", { error: "Please fill all the fields" });
  }
});

module.exports = router;
