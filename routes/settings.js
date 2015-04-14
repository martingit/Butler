'use strict';
var express = require('express');
var telldus = require('telldus');
var bodyParser = require('body-parser');
var fs = require('fs');
var settingsModule = require('../modules/settings');

var router = express.Router();
var jsonParser = bodyParser.json();

router.get('/', function (req,res){
	res.send(settingsModule.get());
});

router.post('/', jsonParser, function(req,res,next){
	settingsModule.save(req.body);
});

module.exports = router;