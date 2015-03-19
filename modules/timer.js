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
	everySecond: function(){
		if (isProcessing){
			console.log("Processing already in progress. I'll check again in a minute");
			return;
		}
		var date = new Date();
		if (date.getSeconds() != 0){
			return;
		}
		date.setMilliseconds(0);
		//console.log("New minute has arrived: " + date.getHours() + ":" + date.getMinutes());
		isProcessing = true;

		var queueList = scheduleModule.getQueueList().items;
		if (queueList.length == 0){
		//console.log("No queue found. Trying to generate new")
			scheduleModule.generateQueue();
			queueList = scheduleModule.getQueueList().items;
		}
		var workAdded = false;
		//console.log('Found ' + queueList.length + 'items to process');
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
			  //workerQueue.push(workerItem);
			  workAdded = true;
			  queuer.add(workerItem);
			}
		}
		if(workAdded){
			console.log('work added to queue');
			setTimeout(scheduleModule.generateQueue(), 1000);
		}
		//console.log("Finished processing queue.");
		isProcessing = false;
	},

	/*processWorkerQueue: function(){
	  if (isWorking || workerQueue.length === 0){
	    return;
	  }
	  isWorking = true;
	  console.log(workerQueue[0].actionName + " " + workerQueue[0].deviceName);
	  deviceModule.updateDeviceStatus(workerQueue[0].deviceId, workerQueue[0].action, 0);
	  workerQueue.splice(0,1);
	  isWorking = false;
	},*/
};