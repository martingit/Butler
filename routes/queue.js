var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var scheduleHandler = require('../handlers/schedule');
var router = express.Router();

router.get('/', function (req,res){
	res.send(scheduleHandler.getQueueList());
});

router.get('/reload', function (req, res, next){
	scheduleHandler.generateQueue();
	res.send(scheduleHandler.getQueueList());
});

module.exports = router;