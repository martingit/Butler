var telldus = require('telldus');
(function() {
	var _global = this;
	var devices = [];
	
	function updateDevices(list) {
		devices = [];
		for (var i = 0; i < list.length; i++) {
			var device = list[i];
			devices.push({
	            "status": device.status.name === "ON",
	            "id": device.id,
	            "level": 0,
	            "name": device.name,
	            "dimmable": device.methods.indexOf("DIM") > -1,
	            "type": device.model,
	        });
		}
	}
	function refreshDevices(){
		console.log('loading devices from telldus');
		var deviceList = telldus.getDevicesSync();
		updateDevices(deviceList);
	}
	function getDevices(){
		return devices;
	}
	function getDeviceById(deviceId){
		for (var i = devices.length - 1; i >= 0; i--) {
			if(devices[i].id === deviceId){
				return devices[i];
			}
		};
		return null;
	}
	function switchDevice(deviceId, status){
		if (status){
			telldus.turnOn(deviceId);
		} else {
			telldus.turnOff(deviceId);
		}
	}
	function dimDevice(deviceId, level){
		telldus.dim(deviceId, level);
	}
	function updateDeviceStatus(deviceId, status, level){
		for (var i = devices.length - 1; i >= 0; i--) {
			if(devices[i].id === deviceId){
				if (status === null && level === 0){
					status = false;
				}
				if (level > 0){
					devices[i].status = true;
					devices[i].level = level;
					dimDevice(deviceId, level);
				} else {
					devices[i].status = status;
					switchDevice(deviceId, status);
				}
				return devices[i];
			}
		};
		return null;
	}
	var devicehandler = {
		updateDevices: updateDevices,
		refreshDevices: refreshDevices,
		getDevices: getDevices,
		getDeviceById: getDeviceById,
		switchDevice: switchDevice,
		dimDevice: dimDevice,
		updateDeviceStatus: updateDeviceStatus,
	};

	if (typeof(module) != 'undefined' && module.exports) {
    	// Publish as node.js module
    	console.log('exports devicehandler');
    	refreshDevices();
    	module.exports = devicehandler;
	}
	
}).call(this);