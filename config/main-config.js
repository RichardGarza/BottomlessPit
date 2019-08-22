require("dotenv").config();

const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const passportConfig = require("./passport-config");
const session = require("express-session");
const flash = require("express-flash");

module.exports = {
  init(app, express) {
    // Init Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.set("view engine", "ejs");
    app.use(express.static("public"));
    app.use(
      session({
        secret: process.env.cookieSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1.21e9 }
      })
    );
    app.use(flash());

    // Initialize passport verification
    passportConfig.init(app);

    // Start Server
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`App is listening on port: ${PORT}`);
    });

    app.use(flash());

    app.use((req, res, next) => {
      res.locals.currentUser = req.user;
      next();
    });
  }
};
