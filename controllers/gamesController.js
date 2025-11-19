const Game = require("../models/Game");
const { StatusCodes } = require("http-status-codes");

// Game CRUD operations
const gameShow = async (req, res) => {
  const games = await Game.find({ createdBy: req.user._id }).sort("createdAt");
  res.render("games", { games, csrfToken: req.csrfToken() });
};

const createGame = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    await Game.create(req.body);
    // after creating, go back to the list
    req.flash("success", "Game created");
    return res.redirect("/games");
  } catch (err) {
    req.flash("error", "Failed to create game");
    console.error(err);
    return res.redirect("/games");
  }
};

const getAGame = async (req, res) => {
  // get specific game by game & user Id
  const { id: gameId } = req.params;
  const game = await Game.findOne({ _id: gameId, createdBy: req.user._id });
  if (!game) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: `No game with id ${gameId}` });
  }
  return res.status(StatusCodes.OK).json({ game });
};

const updateGame = async (req, res) => {
  const gameId = req.params.id;
  const { difficulty, mistakes, usedHints, status } = req.body;
  // require all params to update
  if (
    difficulty === "" ||
    mistakes === "" ||
    usedHints === "" ||
    status === ""
  ) {
    req.flash(
      "error",
      "Difficulty, mistakes, usedHints, and status fields cannot be empty!"
    );
    return res.redirect("/games");
  }
  const game = await Game.findOneAndUpdate(
    { _id: gameId, createdBy: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!game) {
    req.flash("error", `No game with id ${gameId}`);
    return res.redirect("/games");
  }
  req.flash("success", "Game updated");
  return res.redirect("/games");
};

const deleteGame = async (req, res) => {
  const gameId = req.params.id;
  const game = await Game.findOneAndDelete({
    _id: gameId,
    createdBy: req.user._id,
  });
  if (!game) {
    req.flash("error", `No game with id ${gameId}`);
    return res.redirect("/games");
  }
  req.flash("success", "Game deleted");
  return res.redirect("/games");
};

const gameForm = async (req, res) => {
  const gameId = req.params.id;
  const game = await Game.findOne({ _id: gameId, createdBy: req.user._id });
  if (!game) {
    req.flash("error", `No game with id ${gameId}`);
    return res.redirect("/games");
  }
  return res.render("game", { game, csrfToken: req.csrfToken() });
};
module.exports = {
  gameShow,
  getAGame,
  createGame,
  updateGame,
  deleteGame,
  gameForm,
};
