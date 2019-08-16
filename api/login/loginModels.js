'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TaskSchema = new Schema({
  username: {
    type: String,
    required: 'Kindly enter the User Name'
  },
  password: {
    type: String,
    required: 'Kindly enter the Password'
  },
  createdAt:Date
});

module.exports = mongoose.model('login', TaskSchema);
