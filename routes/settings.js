var express = require('express');
var telldus = require('telldus');
var bodyParser = require('body-parser');
var fs = require('fs');
var settingsHandler = require('../handlers/settings');

var router = express.Router();
var jsonParser = bodyParser.json();

router.get('/', function (req,res){
	res.send(settingsHandler.get());
});

router.post('/', jsonParser, function(req,res,next){
	settingsHandler.save(req.body);
});

module.exports = router;