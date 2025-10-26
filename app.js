process.noDeprecation = true; //suppress deprecation warnings in console
const express = require("express");
const app = express();
const passport = require("passport");
const passportInit = require("./passport/passportInit");
let mongoURL = process.env.MONGO_URI;

const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const csrfMiddleware = csrf();

const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require("express-async-errors");
require("dotenv").config(); //loads .env file into process.env object
const session = require("express-session");

const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");

// routers
const gameRouter = require("./routes/games");

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

if (process.env.NODE_ENV == "test") mongoURL = process.env.MONGO_URI_TEST;

const MongoDBStore = require("connect-mongodb-session")(session);

const store = new MongoDBStore({
  uri: url,
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

app.use(session(sessionParams));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(csrfMiddleware);

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

app.use(xss());
app.use(helmet());
app.use(
  rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
  })
)

app.use("/games", auth, gameRouter);
app.use("/secretWord", auth, secretWordRouter);

app.get("/", (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

app.use("/sessions", require("./routes/sessionRoutes"));

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(mongoURL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
