const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.secretWord) {
    // secret word handling
    req.session.secretWord = "syzygy";
  }
  res.render("secretWord", { secretWord: req.session.secretWord, csrfToken: req.csrfToken() });
});

router.post("/", (req, res) => {
  res.render("secretWord", { csrfToken: req.csrfToken() });
  if (req.body.secretWord.toUpperCase()[0] == "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with p");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word has changed.");
  }

  res.redirect("/secretWord");
});

module.exports = router;