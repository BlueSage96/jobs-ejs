const express = require('express');
const router = express.Router();

const { gameShow, createGame, updateGame, deleteGame, gameForm } = require('../controllers/gamesController');
router.route('/').get(gameShow);
router.route('/create').post(createGame);
router.route('/edit/:id').get(gameForm);
router.route("/update/:id").post(updateGame);
router.route("/delete/:id").post(deleteGame);

module.exports = router;