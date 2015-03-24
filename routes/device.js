'use strict';
var express = require('express');
var telldus = require('telldus');
var bodyParser = require('body-parser');

var deviceHandler = require('../modules/device');

var router = express.Router();
var jsonParser = bodyParser.json();

router.get('/', function (req,res){
	res.send({"devices": deviceHandler.getDevices()});
});

router.post('/', jsonParser, function (req, res){
	if (typeof(req.body.status) !== "boolean"){
		req.body.status = undefined;
	}
	if (typeof(req.body.deviceId) !== "number"){
		req.body.deviceId = undefined
	}
	if (req.body.deviceId === undefined || req.body.status === undefined){
		res.status(404);
		res.send({status: "not found"});
		return;
	}
	var device = deviceHandler.updateDeviceStatus(req.body.deviceId, req.body.status);
	res.send(device);
});
router.put('/', jsonParser, function (req, res){
	if (typeof(req.body.level) !== "number"){
		req.body.level = undefined;
	}
	if (typeof(req.body.deviceId) !== "number"){
		req.body.deviceId = undefined
	}
	if (req.body.deviceId === undefined || req.body.level === undefined){
		res.status(404);
		res.send({status: "not found"});
		return;
	}
	var device = deviceHandler.updateDeviceStatus(req.body.deviceId, null, req.body.level);
	res.send(device);
});
router.get('/reload', function (req, res) {
	deviceHandler.refreshDevices();
	res.send({"devices": deviceHandler.getDevices()});
});


module.exports = router;