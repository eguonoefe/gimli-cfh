const mongoose = require('mongoose');

const notification = mongoose.Schema({
  message: String,
  to: String,
  senderName: String,
  senderId: String,
  link: String,
  read: Boolean
});

mongoose.model('Notification', notification);
