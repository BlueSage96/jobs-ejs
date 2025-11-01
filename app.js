require("dotenv").config(); //loads .env file into process.env object
process.noDeprecation = true; //suppress deprecation warnings in console
const express = require("express");
const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const passport = require("passport");
const passportInit = require("./passport/passportInit");

const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const csrfMiddleware = csrf({ cookie: true });

const session = require("express-session");
const sessionRoutes = require("./routes/sessionRoutes");
const sessionSecret = process.env.SESSION_SECRET;
const url = process.env.MONGO_URI;

const flash = require("connect-flash");
const locals = require("./middleware/storeLocals");
const xss = require("xss-clean");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("express-async-errors");
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");

// routers
const gameRouter = require("./routes/gamesRoute");
const MongoDBStore = require("connect-mongodb-session")(session);

const store = new MongoDBStore({
  uri: mongoURL,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
}

app.use(cookieParser(sessionSecret));
app.use(session(sessionParams));
passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(flash());
app.use(csrfMiddleware);
app.use(locals);

app.set("view engine", "ejs");

app.use(xss());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.get("/multiply", (req, res) => {
    const result = req.query.first * req.query.second;
    if (result.isNaN) result = "NaN";
    else if (result == null) result = "null";
    res.json({ result: result });
});

app.use((req, res, next) => {
    if (req.path == "/multiply") res.set("Content-Type", "application/json");
    else res.set("Content-Type", "text/html");
    next();
});

app.use("/games", auth, csrfMiddleware, gameRouter);
app.use("/secretWord", auth, secretWordRouter);

app.get("/", csrfMiddleware, (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

app.use("/sessions", sessionRoutes);

app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).send(`That page (${req.mongoURL}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports = { app };