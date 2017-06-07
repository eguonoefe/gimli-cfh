/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  User = mongoose.model('User');
var avatars = require('./avatars').all();

/**
 * Show sign up form
 */

exports.verifyJWT = function (req, res) {
  console.log('came here', req);
  var jwt = req.headers['authorization'];
  return res.json({ 'jwt': jwt });
}
exports.signup = function (req, res) {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec(function (err, existingUser) {
      if (!existingUser) {
        var user = new User(req.body);
        console.log(user);

        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save(function (err) {
          if (err) {
            return res.json({ signupStatus: 'fail', message: err });
          }
          // create jwt payload
          var tokenData = {
            userMail: user.email
          };
          var jwtToken = jwt.sign(tokenData, process.env.TOKENSECRET);
          req.logIn(user, function (err) {
            if (err) return res.json({ signinStatus: 'fail', message: err });
            return res.json({ signupStatus: 'success', token: jwtToken });
          });
        });
      } else {
        return res.json({ signupStatus: 'fail', message: 'User already exists' });
      }
    });
  } else {
    return res.json({ signupStatus: 'fail', message: 'Every field is required' });
  }
};

/**
 * Show sign up form
 */
exports.signin = function (req, res) {
  if (req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec(function (err, user) {
      if (user) {
        // create jwt payload
        var tokenData = {
          userMail: req.body.email
        };
        var jwtToken = jwt.sign(tokenData, process.env.TOKENSECRET);
        req.logIn(user, function (err) {
          if (err) return res.json({ signinStatus: 'fail', message: err });
          return res.json({ signinStatus: 'success', token: jwtToken });
        });
      } else {
        return res.json({ signinStatus: 'fail', message: 'Wrong email or password' });
      }
    });
  } else {
    return res.json({ signinStatus: 'fail', message: 'Every field is required' });
  }
};

