const mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Notification = mongoose.model('Notification');

exports.addFriend = (req, res) => {
  const friend = req.body.friend,
    userId = req.body.userId;
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
            friendId: req.body.friend.userId
          });
      }
    });
};

function isBigEnough(value) {
  return value >= 10;
}

let filtered = [12, 5, 8, 130, 44].filter(isBigEnough);

exports.getFriends = (req, res) => {
  const hint = req.query.searchText;
  User.findOne({ _id: req.query.userId })
    .exec((err, user) => {
      if (err) return res.jsonp({ error: '403' });
      if (!user) return res.jsonp({ error: '404' });
      const friends = user.friends;
      let filterFriend = friends.filter(value =>
        value.userName.toLowerCase().includes(hint.toLowerCase()));
      res.send(filterFriend);
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

exports.deleteInvite = (req, res) => {
  const notifyId = req.query.noticeId;
  Notification.findByIdAndRemove(notifyId, (err, notification) => {
    res.send(notification.link);
  });
};

exports.deleteFriend = (req, res) => {
  const userId = req.query.userId;
  const friend = req.query.friend;
  User.findById(
    { _id: userId }, (err, resFriend) => {
      if (!err) {
        let friendIndex = null;
        resFriend.friends.forEach((friendId, index) => {
          if (friendId.userId === JSON.parse(friend).userId) {
            friendIndex = index;
          } else {
            friendIndex = -1;
          }
        });
        if (friendIndex !== -1) {
          resFriend.friends.splice(friendIndex, 1);
          resFriend.save((error) => {
            if (!error) {
              res.send('success');
            }
          });
        }
      }
    }
    // { $pullAll: { friends: [friend] } },
    // (err) => {
    //   if (!err) {
    //     res.json(
    //       {
    //         deleted: true,
    //         friendName: friend.userName,
    //         friendId: friend.userId
    //       });
    //   }
    // }
    );
  // User.find(
  //   { _id: userId },
  //   { $pullAll: { friends: [friend] } },
  //   (err) => {
  //     if (!err) {
  //       res.json(
  //         {
  //           deleted: true,
  //           friendName: friend.userName,
  //           friendId: friend.userId
  //         });
  //     }
  //   });
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
