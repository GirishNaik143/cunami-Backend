'use strict';
const utils = require('util');
const CbQueryManager    = require('../utils/CbQueryManager');
var mongoose = require('mongoose'),
  userDetails = mongoose.model('userDetails');

  exports.findAll = function(req, res){
    var processedQuery = CbQueryManager.processRequestQuery(req.query);
    userDetails.find(processedQuery.query, processedQuery.select, processedQuery.cursor,function(err, userDetails) {
      if (err) {
        utils.log('Error occurrred while fetching the userDetails!');
        utils.log('Error details:=> %s', utils.inspect(err, {showHidden: false, depth: null}));
        res.send(err);
    } 
     return res.send(userDetails);
    });
  };
  exports.add = function(req, res) {
    userDetails.create(req.body, function (err, userDetails) {
      if (err) {
        utils.log('Error occurrred while Posting the userDetails!');
        return console.log(err);
    }
    return res.send(userDetails);
    });
  };
  exports.findById = function(req, res){
    userDetails.find({orderId:req.params.orderId}, function(err, userDetails) {  
      if (err) {
          utils.log('Error occurrred while fetching the userDetails by ID!');
          return console.log(err);
      }
      utils.log('Returning userDetails by id!!');
      //res.json(userDetails);
      return res.send(userDetails);
      });
  };
  //updating the values
  module.exports.edit = function(req, res) {  
    if (req.params._id) {
      var target = {};
      target._id = req.params._id;
      //change the userDetails username
      if (req.body.username) {
          target.username = req.body.username;
      }
      if (req.body.password) {
        target.password = req.body.password;
      }
      if (req.body.email) {
        target.email = req.body.email;
      }
      if (req.body.phno) {
        target.phno = req.body.phno;
      }
      utils.log('Save Existing userDetails Item with Id: ');
      userDetails.updateMany({_id:req.params._id}, target,function(err, leadResponseResult) {
        if (err) {
          console.log('Error occurred in saving the new userDetails!');
          res.send(err);
      }
        utils.log('inside Updation');
        utils.log(leadResponseResult);
        res.send(leadResponseResult);
      })
    }
  }
  exports.delete = function(req, res){
    userDetails.remove({_id:req.params._id}, function(err, userDetails) {
      if (err) {
        utils.log('Error occurrred while Deleting the userDetails!');
        return console.log(err);
    }
    utils.log('Deleted userDetails!!');
    //res.json(userDetails);
    return res.send(userDetails);
    });
  };