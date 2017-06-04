/**
 * Generic require login routing middleware
 */

exports.requiresLogin = ((req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.send(401, 'User is not authorized');
  }
  next();
});

/**
 * User authorizations routing middleware
 */
exports.user = {
  hasAuthorization: (req, res, next) => {
    if (req.profile.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  }
};

exports.authenticate = ((req, res, next) => {
  let token;
  // find the user
  User.findOne({
    name: req.body.name
  }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {
      // check if password matches
      if (user.password !== req.body.password) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        // if user is found and password is right
        // create a token
        token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token
        });
      }
    }
  });
  next();
});
