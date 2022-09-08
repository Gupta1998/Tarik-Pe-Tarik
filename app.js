const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const moment = require("moment");
const methodOverride = require("method-override");
const passport = require("passport");
const hbs = require("hbs");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 3000;

// Load config
dotenv.config({ path: "./config/config.env" });

connectDB();
const app = express();

// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// Static
app.use(express.static(path.join(__dirname, "/public")));

// session
app.use(
  session({
    secret: "verygoodsecret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);

// Passport config
require("./config/passport")(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Handlebars
app.set("view engine", "hbs");
hbs.registerHelper("formatDate", function (date, format) {
  return moment(date).utc().format(format);
});
hbs.registerPartials(path.join(__dirname, "./views/partials"));

// Routes
app.use(require("./routes/route"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
