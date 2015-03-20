var telldus = require('telldus');
var devices = [];
function nameCompare(a,b) {
	if (a.name < b.name){
		return -1;
	}
	if (a.name > b.name){
		return 1;
	}
	return 0;
}
module.exports = {
	dimDevice: function(deviceId, level){
		telldus.dim(deviceId, level);
	},
	getDevices: function() {
		return devices;
	},
	getDeviceById: function(deviceId){
		for (var i = devices.length - 1; i >= 0; i--) {
			if(devices[i].id === deviceId){
				return devices[i];
			}
		};
		return null;
	},
	getName: function(deviceId){
		var device = module.exports.getDeviceById(deviceId);
		return device.name;
	},
	refreshDevices: function() {
		console.log('loading devices from telldus');
		var deviceList = telldus.getDevicesSync();
		module.exports.updateDevices(deviceList);
	},
	switchDevice: function(deviceId, status){
		if (status){
			telldus.turnOn(deviceId);
		} else {
			telldus.turnOff(deviceId);
		}
	},
	updateDevices: function(list) {
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
		devices = devices.sort(nameCompare);
	},
	updateDeviceStatus: function(deviceId, status, level){
		for (var i = devices.length - 1; i >= 0; i--) {
			if(devices[i].id === deviceId){
				if (status === null && level === 0){
					status = false;
				}
				if (level > 0){
					devices[i].status = true;
					devices[i].level = level;
					module.exports.dimDevice(deviceId, level);
				} else {
					devices[i].status = status;
					module.exports.switchDevice(deviceId, status);
				}
				return devices[i];
			}
		};
		return null;
	},
};
