'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TaskSchema = new Schema({
  name: {
    type: String
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  phno: {
    type: Number
  },
});

module.exports = mongoose.model('userDetails', TaskSchema);