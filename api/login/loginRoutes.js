'use strict';
module.exports = function(app) {
  var login = require('../login/loginController');

    // login List Routes
    app.get('/api/login', login.findAll);
    app.post('/api/login', login.add);
    //get  by id
    app.get('/api/login/:username', login.findById);
    app.put('/api/login/:username', login.edit);
    app.delete('/api/login/:username', login.delete);
};
