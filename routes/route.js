const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");
const { isLoggedIn, isLoggedOut } = require("../middleware/auth");

// get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ registrationDate: 1 });
    res.render("main", { title: "Home", events });
  } catch (e) {
    res.send(e);
  }
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
    res.redirect("/dashboard");
  }
);

// show add event page
router.get("/add", isLoggedIn, (req, res) => {
  res.render("add", { title: "Add Event" });
});

// add event handler
router.post("/events/add", isLoggedIn, async (req, res) => {
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

// show admin dashboard
router.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    const events = await Event.find().sort({ registrationDate: 1 });
    res.render("dashboard", { events, title: "Dashboard" });
  } catch (e) {
    res.render("error/500");
  }
});

// show edit page
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.render("error/400");
    }

    res.render("edit", { event });
  } catch (e) {
    res.render("error/500");
  }
});

// edit event handler
router.put("/events/:id", isLoggedIn, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      res.render("error/400");
    } else {
      event.name = req.body.name;
      event.eligibility = req.body.eligibility;
      event.mode = req.body.mode;
      if (!req.body.registrationDate) {
        event.registrationDate = event.registrationDate;
      } else {
        event.registrationDate = req.body.registrationDate;
      }
      if (!req.body.testDate) {
        event.testDate = event.testDate;
      } else {
        event.testDate = req.body.testDate;
      }
      await event.save();
      res.redirect("/dashboard");
    }
  } catch (e) {
    res.render("error/500");
  }
});

// delete event handler
router.delete("/events/:id", isLoggedIn, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.render("error/400");
    }
    await Event.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (e) {
    res.render("error/500");
  }
});

// logout
router.get("/logout", function (req, res, next) {
  req.logout((err) => {
    if (err) return next();
  });
  res.redirect("/");
});

module.exports = router;
