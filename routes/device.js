var express = require('express');
var telldus = require('telldus');
var bodyParser = require('body-parser');

var deviceHandler = require('../handlers/device');

var router = express.Router();
var jsonParser = bodyParser.json();

router.get('/', function (req,res){
	res.send({"devices": deviceHandler.getDevices()});
});

router.post('/', jsonParser, function (req, res){
	var deviceId = parseInt(req.body.deviceId);
	var status = false;
	if(req.body.status === 'true'){
		status = true;
	} else if (req.body.status === 'false'){
		status = false;
	} else {
		status = undefined;
	}
	if (deviceId === undefined || status === undefined){
		res.send('not valid params');
		return;
	}
	var device = deviceHandler.updateDeviceStatus(deviceId, status);
	res.send(device);
});
router.put('/', jsonParser, function (req, res){
	var deviceId = parseInt(req.body.deviceId);
	var level = parseInt(req.body.level);
	if (deviceId === NaN || level === NaN){
		res.send({status: "Invalid params"});
		return;
	}
	var device = deviceHandler.updateDeviceStatus(deviceId, null, level);
	res.send(device);
});
router.route('/reload').get(function (req, res) {
	deviceHandler.refreshDevices();
	res.send({"devices": deviceHandler.getDevices()});
});

module.exports = router;