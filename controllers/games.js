const Game = require('../models/Game');
const { StatusCodes } = require('http-status-codes');

// Game CRUD operations
  const gameShow = async (req, res) => {
    const games = await Game.find({ createdBy: req.user._id }).sort("createdAt");
    res.render("games", { games, csrfToken: req.csrfToken() });
  };

const createGame = async (req, res) => {
   req.body.createdBy = req.user._id;
   const game = await Game.create(req.body);
   res.render("game", { game: null });
};

// const getAllGames = async (req, res) => {
//    const games = await Game.find({createdBy: req.user._id}).sort('createdAt');
//    res.status(StatusCodes.OK).json({games, count: games.length});
// };

const getAGame = async (req, res) => {
  // get specific game by game & user Id
   const { id: gameId } = req;
   const game = await Game.findOne({ _id: gameId, createdBy: req.user._id });
   if (!game) {
     req.flash("error",`No game with id ${gameId}`);
   }
   res.status(StatusCodes.OK).json({ game });
};

const updateGame = async (req, res) => {
    const { user: {_id: userId}, body: {difficulty, mistakes, usedHints, status}, params: { id: gameId }} = req;
    // require all params to update
    if (difficulty === '' || mistakes === '' || usedHints === '' || status === '') {
       req.flash("error",'Difficulty, mistakes, usedHints, and status fields cannot be empty!');
    }
    const game = await Game.findOne({_id: gameId, createdBy: userId}, req.body, {new: true, runValidators: true});
     if (!game) {
      req.flash("error",`No game with id ${gameId}`);
      return res.redirect("/games");
     } 

     res.render("game", { game, csrfToken: req.csrfToken() });
};


const deleteGame = async (req, res) => {
  // const { params: { id: gameId }}
    const { id: gameId } = req;
    const game = await Game.findOneAndDelete({ _id: gameId, createdBy: req.user._id });
    if (!game) {
      req.flash("error",`No game with id ${gameId}`);
    }
    res.status(StatusCodes.OK).json({ game, msg: "The entry was deleted" });
};

module.exports = { gameShow, getAGame, createGame, updateGame, deleteGame };
