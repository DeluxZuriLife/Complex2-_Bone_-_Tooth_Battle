var express  = require('express');
var app      = express();
var port     = process.env.PORT || 20798;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var db

// configuration 
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db);
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs');

// required for passport
app.use(session({
    secret: 'rcbootcamp2021b',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// models 
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
    tL: String, tC: String, tR: String,
    mL: String, mC: String, mR: String,
    bL: String, bC: String, bR: String,
  },
  currentPlayer: String,
  gameResult: String, // winner or "in-progress"
  timer: Number,
  date: { type: Date, default: Date.now },
});
const Game = mongoose.model('Game', gameSchema);
module.exports = Game;

// User stats model
const userSchema = new mongoose.Schema({
  name: String,
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

// save game state 
function saveGameState(gameData) {
  const newGame = new Game(gameData);
  newGame.save((err, game) => {
    if (err) {
      console.error('Error saving game state:', err);
    } else {
      console.log('Game state saved:', game);
    }
  });
}

// declare winner and update user stats
function declareWinner(gameId, winnerName) {
  Game.findByIdAndUpdate(gameId, { gameResult: winnerName }, (err, game) => {
    if (err) {
      console.error('Error declaring winner:', err);
    } else {
      console.log(`${winnerName} has won the game!`);

      // Update user stats
      User.findOneAndUpdate(
        { name: winnerName },
        { $inc: { gamesWon: 1, gamesPlayed: 1 } },
        { upsert: true },
        (err, user) => {
          if (err) console.error('Error updating winner stats:', err);
        }
      );

      // Update opponent's gamesPlayed count
      const loserName = game.player1.name === winnerName ? game.player2.name : game.player1.name;
      User.findOneAndUpdate(
        { name: loserName },
        { $inc: { gamesPlayed: 1 } },
        { upsert: true },
        (err, user) => {
          if (err) console.error('Error updating loser stats:', err);
        }
      );
    }
  });
}

// live update route 
app.post('/api/updateGame', (req, res) => {
  const { gameId, board, currentPlayer, timer } = req.body;

  Game.findByIdAndUpdate(gameId, {
    board,
    currentPlayer,
    timer
  }, (err, game) => {
    if (err) {
      console.error('Error updating game:', err);
      return res.status(500).send('Update failed');
    }
    res.status(200).send('Game updated');
  });
});

// launch 
app.listen(port);
console.log('The magic happens on port 20798' + port);