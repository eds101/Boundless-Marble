var User = require('./userModel.js');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../jwtAuth.js');

//USERNAMES ARE PHONE NUMBERS

module.exports = {
  parseUserUrl: function (req, res, next, phone) {
    module.exports.findByPhone(phone, function (phone, err) {
      if(!phone) {
       res.status(404).send('No user with number ' + phone + ' in database');
      }
      req.phone = phone;
      next();
    });
  },


  findByPhone: function (phone, callback) {
    console.log('hello');
    User.findOne({where: {phone: phone}})
    .then(function (phone) {
      callback(phone);
    });
  },

  findByEmail: function (req, res, email, callback) {
    User.findOne({where: {email: email}})
    .then(function (user) {
      if (!user) {
        res.status(404).send('No user with email ' + email + ' in database');
      } else {
        callback(user);
      }
    });
  },

  browse: function (req, res) {
    User.findAll()
    .then(function (users) {
      res.status(200).send(JSON.stringify(users));
    });
  },

  signup: function (req, res, next) {
    // check to see if user already exists
    console.log(req.body.phone);
    User.findOne({where: {phone: req.body.phone}})
      .then(function(phone) {
        if(user) {
          res.status(401).send('Phone number already exists');
        } else {
          // make a new user if not one
          var user = User.build(req.body);
            bcrypt.hash(user.password, null, null, function(err, hash){
              user.password = hash;
              user.save()
                .complete(function(err){
                  if(!!err){
                    console.log('An error occurred while creating the user: ', err);
                    next(new Error('Error saving user to the database'));
                  } else {

                    console.log('The user was successfully created.');
                    var token = jwt.createToken(user.phone);
                    res.status(201).json({token: token});
                  }
                });
            });
        }
      })
      // .then(function (user) {
      //   // TODO: create token to send back for auth
      //   // var token = jwt.encode(user, 'secret');
      //   // res.json({token: token});
      //   res.send(req.body);
      // })
      .catch(function (error) {
        next(error);
      });
  },

  signin: function(req, res, next) {
    console.log(req.body.phone);
    User.findOne({ where: { phone: req.body.phone } })
      .then(function(user){
        if(user){
          bcrypt.compare(req.body.password, user.password, function(err, result){
            if(result){
              // return jwt
              console.log('signed in!');
              var token = jwt.createToken(user.phone);
              res.status(200).json({token: token});
            } else {
              console.log('Login incorrect');
              res.status(401).send('Login incorrect');
            }
          });
        } else {
          console.log('no account found with that phone number');
          res.status(401).send('No account found with that phone number!');
        }
      })
      .catch(function(error){
        next(error);
      });
  },

  groups: function (req, res) {
    console.log(req.body);
    req.body.phone.getGroups()
    .then(function (groups) {
      res.status(200).send(JSON.stringify(groups));
    });
  }
};
