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
	var deviceId = req.body.deviceId;
	var status = req.body.status;
	var device = deviceHandler.updateDeviceStatus(deviceId, status);
	res.send(device);
});
router.put('/', jsonParser, function (req, res){
	var deviceId = req.body.deviceId;
	var level = req.body.level;
	var device = deviceHandler.updateDeviceStatus(deviceId, null, level);
	res.send(device);
});
router.route('/reload').get(function (req, res) {
	deviceHandler.refreshDevices();
	res.send({"devices": deviceHandler.getDevices()});
});

module.exports = router;