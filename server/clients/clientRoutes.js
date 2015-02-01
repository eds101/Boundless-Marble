var groupController = require('../groups/groupController.js');
var userController = require('../users/userController.js');

module.exports = function (app) {
  app.post('/twilio', function determineRoute (req, res){
    userController.findByPhone(req.body.From.slice(2), function (user) {
      req.user = user;

      if (req.body.Body.slice(0,5).toUpperCase() === "JOIN ") {
        req.body = {'name': req.body.Body.slice(5)};
        groupController.join(req, res);
      } else if (req.body.Body.slice(0,7).toUpperCase() === "CREATE ") {
        req.body = {'name': req.body.Body.slice(7)};
        groupController.create(req, res);
      } else if (req.body.Body === "BROWSE"){
        groupController.browse(req, res);
      // } else if (req.body.body.slice(0,6).toUpperCase() === "SIGN UP") {
      //   TODO: capture user info through sms
      //   userController.signup(req, res);
      } else {
        groupController.find(req.body.Body, function (group) {
          req.group = group;
          groupController.ping(req, res);
        });
      }
    });
  });

  app.post('/sendgrid', function determineRoute (req, res) {
    var user = userController.findByEmail(req.body.From);
  });

};
