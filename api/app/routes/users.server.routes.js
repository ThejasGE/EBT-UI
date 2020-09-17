var users = require('../../app/controllers/users.server.controller');


module.exports = function(app) {
    /*app.route('/api/login').post(users.authenticate);
      app.route('/api/register').post(users.create);
      app.route('/api/edituser').post(users.edituser);
      app.route('/api/unlock').post(users.unlock); */
    app.route('/api/createUser').post(users.createUser);
    app.route('/api/createtoken').post(users.createtoken);
    app.route('/api/authUser').post(users.authUser, users.createtoken);
    app.route('/api/getUsers').get(users.getUsers);
    app.route('/api/updateUser').post(users.updateUser)
};