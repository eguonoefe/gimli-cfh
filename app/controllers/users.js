/**
 * Module dependencies.
 */
let mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  User = mongoose.model('User'),
  Game = mongoose.model('Game');
const avatars = require('./avatars').all();
const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

/**
 * Auth callback
 */
exports.authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 */
exports.signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/');
  }
};

/**
 * Show sign up form
 */
exports.signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/');
  }
};

/**
 * Logout
 */
exports.signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = (req, res) => {
  // create jwt payload
  let tokenData = {
    userMail: req.body.email
  };
  let jwtToken = jwt.sign(tokenData, process.env.TOKENSECRET);
  res.header('Authorization', jwtToken);
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
    .exec((err, user) => {
      if (user.avatar !== undefined) {
        res.redirect('/#!/');
      } else {
        res.redirect('/#!/choose-avatar');
      }
    });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }

};
exports.createJWT = function(req, res) {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec(function(err,existingUser) {
      if (!existingUser) {
        let user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save(function(err) {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user: user
            });
          }
          return res.json({'token': 'I love you!'});
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
}
/**
 * Create user
 */
exports.create = (req, res) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user,
            });
          }
          // create jwt payload
          const tokenData = {
            userMail: user.email
          };
          const jwtToken = jwt.sign(tokenData, process.env.TOKENSECRET);

          req.logIn(user, (err) => {
            if (err) return next(err);
            res.header('Authorization', jwtToken);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};

/**
 * Assign avatar to user
 */
exports.avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
    .exec((err, user) => {
      user.avatar = avatars[req.body.avatar];
      user.save();
    });
  }
  return res.redirect('/#!/');
};

exports.addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount &&
      req.body.crowdrise_donation_id &&
      req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
      .exec((err, user) => {
        // Confirm that this object hasn't already been entered
        let duplicate = false;
        for (let i = 0; i < user.donations.length; i++) {
          if (user.donations[i].crowdrise_donation_id ===
            req.body.crowdrise_donation_id) {
            duplicate = true;
          }
        }
        if (!duplicate) {
          console.log('Validated donation');
          user.donations.push(req.body);
          user.premium = 1;
          user.save();
        }
      });
    }
  }
  res.send();
};

/**
 *  Show profile
 */
exports.show = (req, res) => {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user,
  });
};

/**
 * Send User
 */
exports.me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User +${id}`));
      req.profile = user;
      next();
    });
};

/**
 * Gets the list of users in the database
 * @function search
 * @param {any} req -
 * @param {any} res -
 * @returns {object} - users
 */
exports.search = (req, res) => {
  User.find().exec((err, user) => {
    res.jsonp(user);
  });
};

/**
 * Gets the list of users in the database
 * @function search
 * @param {any} req -
 * @param {string} req.params.username - the query string
 * @param {any} res -
 * @returns {object} - users
 */
exports.searchUser = (req, res) => {
  const username = req.params.username;
  User.find({
    name: { $regex: `^${username}`, $options: 'i' }
  }).exec((err, user) => {
    if (err) return res.jsonp({ error: '403' });
    if (!user) return res.jsonp({ error: '404' });
    res.jsonp(user);
  }
  );
};

/**
 * Send invite mails to users
 * @function sendMail
 * @param {any} req -
 * @param {object} req.params.email - Contains the user's data
 * @param {any} res -
 * @returns {any} - sends mail
 */
exports.sendMail = (req, res) => {
  const email = JSON.parse(req.params.email);
  const fromEmail = new helper.Email('gimli-cfh@andela.com');
  const toEmail = new helper.Email(email.email);
  const subject = 'CFH - Game invite';
  const url = decodeURIComponent(email.url);
  const html = `
    <h5>Hey yo!</h5>
    <p>You have been invited to play Card For Humanity (CFH). </p>
    <p>Card For Humanity is a game tailored towards making the world
      a better place for all. We ensure your donation is channeled towards
      providing comfort to people of lesser priviledge around
      the world</p><br />
    <p>Your friends are waiting! <a href="${url}">
      Get in the game now.</a></p>
      <p>Copyright &copy; 2017
      <a href="https://staging-gimli.herokuapp.com">GIMLI CFH</a>
  `;
  const content = new helper.Content('text/html', html);
  const mail = new helper.Mail(fromEmail, subject, toEmail, content);
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, (error, response) => {
    if (error) return res.jsonp(error);
    return res.jsonp(response);
  });
};

// Audax edited here
exports.updateUserGameLog = (req, res) => {
  const userID = req.body.userID;
  User
    .findOne({
      _id: userID
    })
    .exec((err, user) => {
      if (user) {
        user.gamesPlayed += 1;
        user.totalGamePoints += req.body.points;
        if (req.body.isWinner) {
          user.gamesWon += 1;
        }
        user.save((err) => {
          if (err) {
            return res.jsonp(err);
          }
          console.log('current user', req.body);
          return res.json({ status: 200 });
        });
      }
    });
};

exports.saveGameDetails = (req, res) => {
  // save details of users in the game
  // AUDAX STARTS HERE
  const tempList = [];
  req.body.players.forEach((player) => {
    if (tempList.indexOf(player.userID) > -1) {
      return;
    }
    User
      .findOne({
        _id: player.userID
      })
      .exec((err, user) => {
        if (user) {
          user.gamesPlayed += 1;
          user.totalGamePoints += player.points;
          if (req.body.winner.userID === player.userID) {
            user.gamesWon += 1;
          }
          tempList.push(player.userID);
          user.save((err) => {
            if (err) {
              res.json({ status: 'fail', message: err })
            }
             console.log('current user', player);
             res.json({ status: 200, message: player });
          });
        }
      });
  });
    // AUDAX ENDS HERE
            // create new game object
            const newGame = new Game(req.body);
            newGame.save()
            .then(game =>
              res.json({ status: 'success', game })
            )
            .catch(err =>
              res.json({ status: 'fail', message: err })
            );
};

  // Gets leadeeboard
exports.fetchLeaderBoard = (req, res) => {
// res.send('succes  : true')
  User.find({})
 .sort({ totalGamePoints: -1 })
 .limit(30)
 .exec((err, records) => {
   res.send(records);
 });
};

exports.fetchDonations = (req, res) => {
  let pocket = [];
  User.find({})
 .sort({ donations: -1 })
 .limit(30)
 .exec((err, records) => {
   records.forEach((record) => {
     if (record.donations.length > 0) {
       pocket.push(record);
     }
   });
   res.send(pocket);
 });
};

exports.fetchGameHistory = (req, res) => {
  Game.find({})
 .sort({ dateplayed: -1 })
 .limit(30)
 .exec((err, records) => {
   res.send(records);
 });
};
// Audax ends here
