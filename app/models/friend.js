const mongoose = require('mongoose');

const friend = mongoose.Schema({
  Name: String,
  Id: String
});

mongoose.model('Friend', friend);
