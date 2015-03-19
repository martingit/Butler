var express = require('express');
var bodyParser = require('body-parser');

var scheduleModule = require('../modules/schedule');

var router = express.Router();
var jsonParser = bodyParser.json();

router.get('/', function (req,res){
	res.send(scheduleModule.getScheduleList());
});

router.get('/timeline', function (req, res, next){
	res.send(scheduleModule.getTimeline());
});

//Add
router.put('/', jsonParser, function (req, res, next){
	var item = req.body;
	item = scheduleModule.addScheduleItem(item);
	res.send(item);
});

//Update
router.post('/', jsonParser, function (req, res, next){
	var item = req.body;
	scheduleModule.updateScheduleItem(item);
	res.send({status: "Updated"});
});

//Delete
router.delete('/:id', jsonParser, function (req, res, next){
	var itemId = req.params.id;
	scheduleModule.removeScheduleItem(itemId);
	res.send({status: "Deleted"});
});

module.exports = router;