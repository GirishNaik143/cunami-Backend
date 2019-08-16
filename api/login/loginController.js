'use strict';
const utils = require('util');
const CbQueryManager    = require('../utils/CbQueryManager');
var mongoose = require('mongoose'),
  login = mongoose.model('login');

  exports.findAll = function(req, res){
    var processedQuery = CbQueryManager.processRequestQuery(req.query);
    login.find(processedQuery.query, processedQuery.select, processedQuery.cursor,function(err, login) {
      if (err) {
        utils.log('Error occurrred while fetching the login!');
        utils.log('Error details:=> %s', utils.inspect(err, {showHidden: false, depth: null}));
        res.send(err);
    } 
     return res.send(login);
    });
  };
  exports.add = function(req, res) {
    login.create(req.body, function (err, login) {
      if (err) {
        utils.log('Error occurrred while Posting the login!');
        return console.log(err);
    }
    return res.send(login);
    });
  };
  exports.findById = function(req, res){
    login.find({id:req.params.id}, function(err, login) {  
      if (err) {
          utils.log('Error occurrred while fetching the login by ID!');
          return console.log(err);
      }
      utils.log('Returning login by ID!!');
      //res.json(login);
      return res.send(login);
      });
  };
  //updating the values
  module.exports.edit = function(req, res) {  
    if (req.params.username) {
      var target = {};
      target.username = req.params.username;
      //change the login username
      if (req.body.username) {
          target.username = req.body.username;
      }
      if (req.body.password) {
        target.password = req.body.password;
      }
      utils.log('Save Existing login Item with Id: ');
      login.updateMany({username:req.params.username}, target,function(err, leadResponseResult) {
        if (err) {
          console.log('Error occurred in saving the new login!');
          res.send(err);
      }
        utils.log('inside Updation');
        utils.log(leadResponseResult);
        res.send(leadResponseResult);
      })
    }
  }
  exports.delete = function(req, res){
    login.remove({username:req.params.username}, function(err, login) {
      if (err) {
        utils.log('Error occurrred while Deleting the login!');
        return console.log(err);
    }
    utils.log('Deleted login!!');
    utils.log(req.params.username)
    //res.json(login);
    return res.send(login);
    });
  };