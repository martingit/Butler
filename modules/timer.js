var scheduleModule = require('./schedule');
var settingsModule = require('./settings');
var deviceModule = require('./device');

var isProcessing = false;

var queuer = {
	queue: [],
	isWorking: false,
	add: function(msg) {
		if (this.isWorking) {
			this.queue.push(msg);
			return;
		}
		this.isWorking = true;
		this._do(msg);
	},
	_done: function(e) {
		if (this.queue.length === 0) {
			this.isWorking = false;
			return;
		}
		var msg = queuer.queue.splice(0,1)[0];
		this._do(msg);
	},
	_do: function(msg) {
		console.log(msg.actionName + " " + msg.deviceName);
	  	deviceModule.updateDeviceStatus(msg.deviceId, msg.action, 0);
		queuer._done(null);
	}
};

module.exports = {
	run: function(){
		var everySecondInterval = setInterval(module.exports.process, 1000);
	},
	process: function(){
		if (isProcessing){
			console.log("Processing already in progress. I'll check again in a minute");
			return;
		}
		var date = new Date();
		if (date.getSeconds() != 0){
			return;
		}
		date.setMilliseconds(0);
		
		isProcessing = true;

		var queueList = scheduleModule.getQueueList().items;
		if (queueList.length == 0){
		
			scheduleModule.generateQueue();
			queueList = scheduleModule.getQueueList().items;
		}
		var workAdded = false;
		
		for (var i = queueList.length - 1; i >= 0; i--) {
			if (queueList[i].when.getTime() === date.getTime()){
			  var workerItem = {
			    deviceId: queueList[i].deviceId,
			    action: queueList[i].action,
			    level: 0,
			    actionName: queueList[i].actionName,
			    deviceName: queueList[i].deviceName,
			  };
			  if (!queueList[i].isRecurring){
			    scheduleModule.disableScheduleItem(queueList[i].scheduleId);
			  }
			  
			  workAdded = true;
			  queuer.add(workerItem);
			}
		}
		if(workAdded){
			console.log('work added to queue');
			setTimeout(scheduleModule.generateQueue(), 1000);
		}
		isProcessing = false;
	},

};