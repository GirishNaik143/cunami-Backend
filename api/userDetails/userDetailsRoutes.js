'use strict';
module.exports = function(app) {
  var userDetails = require('../userDetails/userDetailsController');

  // userDetails List Routes
  app.get('/api/userDetails', userDetails.findAll);
  app.post('/api/userDetails', userDetails.add);
  //get  by ID
  app.get('/api/userDetails/:_id', userDetails.findById);
  app.put('/api/userDetails/:_id', userDetails.edit);
  app.delete('/api/userDetails/:_id', userDetails.delete);
};
