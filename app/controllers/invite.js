const mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Notification = mongoose.model('Notification');

exports.addFriend = (req, res) => {
  const friend = req.body.friend,
    userId = req.body.userId,
    button = req.body.checkButton;
  if (button === 'Addfriend') {
    User.findOneAndUpdate(
      { _id: userId },
      { $push: { friends: friend } },
      { safe: true, upsert: true },
      (err) => {
        if (!err) {
          res.json(
            {
              succ: 'Successful',
              action: 'addfriend',
              friendId: req.body.friendId
            });
        }
      });
  } else {
    User.update(
      { _id: userId },
      { $pullAll: { friends: [friendId] } },
      (err) => {
        if (!err) {
          res.json(
            {
              succ: 'Successful',
              action: 'unfriend',
              friendId
            });
        }
      });
  }
};

function isBigEnough(value) {
  return value >= 10;
}

var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);

exports.getFriends = (req, res) => {
  const hint = req.query.searchText;
  User.findOne({ _id: req.query.userId })
    .exec((err, user) => {
      if (err) return res.jsonp({ error: '403' });
      if (!user) return res.jsonp({ error: '404' });
      const friends = user.friends;
      var filterFriend = friends.filter(value =>
        value.userName.toLowerCase().includes(hint.toLowerCase()));
      res.jsonp(filterFriend);
    }
    );
};

exports.getInvites = (req, res) => {
  const userId = req.query.userId;
  Notification.find(
    {
      to: userId,
      read: false
    },
    (err, result) => {
      res.send(result);
    });
};

exports.readNotification = (req, res) => {
  const userId = req.body.user_id;
  const id = req.body.notifyId;
  Notification.findOneAndUpdate(
    {
      _id: id
    },
    { $set: { read: 1 } },
    { new: true },
    (err, result) => {
      res.json(
        {
          succ: 'Update Successfully'
        });
    });
};

exports.sendNotification = (req, res) => {
  const link = req.body.url,
    userName = req.body.userName.userName,
    senderId = req.body.userName.userId,
    message = `${userName} has just invited you to join a game`,
    friendId = req.body.friendId;
  const notify = new Notification(
    {
      to: friendId,
      senderName: userName,
      senderId,
      message,
      link,
      read: false
    }
  );
  notify.save();
  res.json(
    {
      status: 'Invite has been sent'
    });
};
