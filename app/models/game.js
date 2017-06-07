/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

const Schema = mongoose.Schema;


/**
 * Question Schema
 */
const GameSchema = new Schema({
  gameID: String,
  players: [{ name: String, points: Number, userID: String }],
  winner: { name: String, userID: String },
  owner: { name: String, userID: String },
  dateplayed: String
});


mongoose.model('Game', GameSchema);
