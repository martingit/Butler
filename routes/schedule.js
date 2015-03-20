var express = require('express');
var bodyParser = require('body-parser');

var scheduleHandler = require('../handlers/schedule');

var router = express.Router();
var jsonParser = bodyParser.json();

router.get('/', function (req,res){
	res.send(scheduleHandler.getScheduleList());
});

router.get('/timeline', function (req, res, next){
	res.send(scheduleHandler.getTimeline());
});

//Add
router.put('/', jsonParser, function (req, res, next){
	var item = req.body;
	item = scheduleHandler.addScheduleItem(item);
	res.send(item);
});

//Update
router.post('/', jsonParser, function (req, res, next){
	var item = req.body;
	scheduleHandler.updateScheduleItem(item);
	res.send({status: "Updated"});
});

//Delete
router.delete('/:id', jsonParser, function (req, res, next){
	var itemId = parseInt(req.params.id);
	if (itemId === NaN){
		res.send({status: "Invalid params"});
		return;
	}
	scheduleHandler.removeScheduleItem(itemId);
	res.send({status: "Deleted"});
});

module.exports = router;