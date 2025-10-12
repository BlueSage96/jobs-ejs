const express = require('express');
const router = express.Router();

const {getAllGames, getAGame, createGame, updateGame, deleteGame} = require('../controllers/game');
router.route('/').post(createGame).get(getAllGames);
router.route('/:id').get(getAGame).delete(deleteGame).patch(updateGame);

module.exports = router;