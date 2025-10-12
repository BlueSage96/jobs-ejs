const Game = require('../models/Game');
const { StatusCodes } = require('http-status-codes');
// const { BadRequestError, NotFoundError } = require('../errors');

// Game CRUD operations
  const gameShow = async (req, res) => {
    const games = await Game.find({ createdBy: req.user._id }).sort("createdAt");
    res.render("games", { games, csrfToken: req.csrfToken() });
  };

const createGame = async (req, res) => {
  req.body.createdBy = req.user_id;
  const game = await Game.create(req.body);
  res.status(StatusCodes.CREATED).json({ game });
};

const getAllGames = async (req, res) => {
   const games = await Game.find({createdBy: req.user_id}).sort('createdAt');
   res.status(StatusCodes.OK).json({games, count: games.length});
};

const getAGame = async (req, res) => {
  // get specific game by game & user Id
   const {
    user:{ userId },
    params:{ id: gameId }
  } = req;
   const game = await Game.findOne({
      _id: gameId, createdBy: userId
   });

   if (!game) {
    //  throw new NotFoundError(`No game with id ${gameId}`);
     throw new Error(`No game with id ${gameId}`);
   }
   res.status(StatusCodes.OK).json({ game });
};

const updateGame = async (req, res) => {
    const {
      body: {difficulty, mistakes, usedHints, status},
      user: { userId },
      params: { id: gameId },
    } = req;
    // require all params to update
    if (difficulty === '' || mistakes === '' || usedHints === '' || status === '') {
      //  throw new BadRequestError('Difficulty, mistakes, usedHints, and status fields cannot be empty!');
       throw new Error('Difficulty, mistakes, usedHints, and status fields cannot be empty!');
    }
    const game = await Game.findOneAndUpdate({_id: gameId, createdBy: userId}, req.body, {new: true, runValidators: true});
     if (!game) {
      //  throw new NotFoundError(`No game with id ${gameId}`);
      throw new Error(`No game with id ${gameId}`);
     }
     res.status(StatusCodes.OK).json({ game });
};

const deleteGame = async (req, res) => {
    const {
      user: { userId },
      params: { id: gameId },
    } = req;
    const game = await Game.findOneAndDelete({
       _id: gameId, createdBy: userId
    });
    if (!game) {
      // throw new NotFoundError(`No game with id ${gameId}`);
      throw new Error(`No game with id ${gameId}`);
    }
    res.status(StatusCodes.OK).json({ game, msg: "The entry was deleted" });
};

module.exports = { gameShow, getAllGames, getAGame, createGame, updateGame, deleteGame };
