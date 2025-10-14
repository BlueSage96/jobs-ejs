const express = require('express');
const router = express.Router();

const { gameShow, getAGame, createGame, updateGame, deleteGame } = require('../controllers/games');
router.route('/').get(gameShow);
router.route('/create').patch(createGame);
router.route('/edit/:id').get(updateGame);
// router.route('/delete/:id').post(deleteGame);
router.post("/delete/:id", deleteGame);
router.route('/:id').get(getAGame);

module.exports = router;