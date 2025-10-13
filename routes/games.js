const express = require('express');
const router = express.Router();

const { gameShow, getAllGames, getAGame, createGame, updateGame, deleteGame } = require('../controllers/games');
router.route('/').post(createGame).get(gameShow);
router.route('/:id').get(getAGame).delete(deleteGame).patch(updateGame);
router.route("/games").get(getAllGames);

module.exports = router;