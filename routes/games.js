const express = require('express');
const router = express.Router();

const { gameShow, getAGame, createGame, updateGame, deleteGame, gameForm } = require('../controllers/games');
router.route('/').get(gameShow);
router.route('/create').post(createGame);
router.route('/edit/:id').get(gameForm);
router.route("/update/:id").post(updateGame);
router.route("/delete/:id").post(deleteGame);

// router.route('/delete/:id').post(deleteGame);
// router.route('/:id').get(getAGame);

module.exports = router;