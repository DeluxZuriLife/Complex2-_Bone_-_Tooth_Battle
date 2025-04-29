const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  player1: {
    name: String,
    shape: String,
  },
  player2: {
    name: String,
    shape: String,
  },
  board: {
    tL: String,
    tC: String,
    tR: String,
    mL: String,
    mC: String,
    mR: String,
    bL: String,
    bC: String,
    bR: String,
  },
  currentPlayer: String,
  gameResult: String,
  timer: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Game', gameSchema);
