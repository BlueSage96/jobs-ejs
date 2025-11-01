const User = require("../models/User");
const parseVErr = require("../utils/parseValidationErrors.js");

const registerShow = (req, res) => {
  res.render("register", { csrfToken: req.csrfToken() });
};

const registerDo = async (req, res, next) => {
  if (req.body.password != req.body.password1) {
    req.flash("error", "The passwords entered do not match.");
    return res.render("register", {
      csrfToken: req.csrfToken(),
    });
  }
  try {
    const user = await User.create(req.body);
    // Reload user from database to ensure it's fully persisted
    const savedUser = await User.findById(user._id);
    if (!savedUser) {
      req.flash("error", "Error creating user account.");
      return res.render("register", {
        csrfToken: req.csrfToken(),
      });
    }
    req.login(savedUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("info", `Welcome ${savedUser.name}!`);
      res.redirect("/");
    });
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.name === "MongoServerError" && e.code === 1100) {
      req.flash("error", "That email address is already registered.");
    } else {
      return next(e);
    }
    return res.render("register", {
      csrfToken: req.csrfToken(),
    });
  }
};

const logoff = (req, res) => {
  // caused csrf errors!!
  // res.render("logoff", { csrfToken: req.csrfToken() });
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

const logonShow = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("logon", { csrfToken: req.csrfToken() });
};

module.exports = { registerShow, registerDo, logoff, logonShow };
