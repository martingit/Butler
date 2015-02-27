var deviceHandler = require('./device');
var settingsHandler = require('./settings');
var uuid = require('node-uuid');
var suncalc = require('suncalc');

var fs = require('fs');
(function() {
//var schedule = {items:[{"id":"C9996576-3FD2-430D-9871-AC2E810250A3","sunday":true,"saturday":true,"thursday":true,"time":"01:00","deviceId":6,"friday":true,"timeTypeId":4,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"C4E2A5FC-7456-4AD1-B068-C701F6E3E958","sunday":true,"saturday":true,"thursday":true,"time":"01:15","deviceId":6,"friday":true,"timeTypeId":3,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"E8D33996-5F20-41FA-996C-FF858D412897","sunday":true,"saturday":true,"thursday":true,"time":"06:30","deviceId":10,"friday":true,"timeTypeId":0,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"A95888E7-D223-425E-855D-DBBD191BB818","sunday":true,"saturday":true,"thursday":true,"time":"08:00","deviceId":10,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"9D404768-F26B-424E-BB0D-86BFE8CED7C9","sunday":false,"saturday":false,"thursday":true,"time":"06:55","deviceId":2,"friday":true,"timeTypeId":0,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"83873445-938A-4232-841A-3622740C69F1","sunday":false,"saturday":false,"thursday":true,"time":"08:00","deviceId":2,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"7A498832-0882-4523-84D4-44943F3CFCB3","sunday":true,"saturday":true,"thursday":true,"time":"01:00","deviceId":2,"friday":true,"timeTypeId":4,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"5FA08B0F-471B-4225-9730-6DE8FA7DD4EB","sunday":true,"saturday":true,"thursday":true,"time":"22:00","deviceId":2,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"BE140A61-8BFB-4950-8DD2-5F1CE8FDFAEB","sunday":true,"saturday":true,"thursday":true,"time":"01:00","deviceId":12,"friday":true,"timeTypeId":4,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"132DAABD-6361-4D2C-99A8-B2C27FF97E7D","sunday":true,"saturday":true,"thursday":true,"time":"22:00","deviceId":12,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true}]};

	var schedule = { items: [] };
	var queueList = [];
	var timeline = [];

	function addScheduleItem(item){
		item.id = uuid.v4();
		item.dirty = false;
		schedule.items.push(item);
		return item;
		saveSchedule();
	}
	function loadSchedule(){
	  try {
		var data = fs.readFileSync('./schedule.json');
	    schedule = JSON.parse(data);
	  }
	  catch (err) {
	    console.log('There has been an error parsing your JSON.')
	    console.log(err);
	  }
	}
	function saveSchedule(){
		var data = JSON.stringify(schedule);
		fs.writeFile('./schedule.json', data, function (err) {
	    if (err) {
	      console.log('There has been an error saving your schedule data.');
	      console.log(err.message);
	      return;
	    }
	    console.log('Schedule saved successfully.')
	  });
	}
	function updateScheduleItem(item){
		for (var i = schedule.items.length - 1; i >= 0; i--) {
			if(schedule.items[i].id === item.id){
				item.dirty = false;
				schedule.items[i] = item;
				saveSchedule();
				return item;
			}
		}
		return null;
	}

	function removeScheduleItem(itemId){
		for (var i = schedule.items.length - 1; i >= 0; i--) {
			if(schedule.items[i].id === itemId){
				schedule.items.splice(i, 1);
				saveSchedule();
				return;
			}
		}
	}
	function generateQueue(){

	}
	function calculateSunsetSunrise(){

	}
	function disableScheduleItem(id){

	}
	function getQueueList(){
		return {items: queueList};
	}
	function getSunrise(){
		var settings = settingsHandler.get();
		var times = suncalc.getTimes(new Date(), settings.latitude, settings.longitude);
		return times.sunrise;
	}
	function getSunset(){
		var settings = settingsHandler.get();
		var times = suncalc.getTimes(new Date(), settings.latitude, settings.longitude);
		return times.sunset;
	}
	function getScheduleList(){
		return schedule;
	}
	function getTimeline(){
		return timeline;
	}

	var scheduleHandler = {
		addScheduleItem: addScheduleItem,
		generateQueue: generateQueue,
		calculateSunsetSunrise: calculateSunsetSunrise,
		disableScheduleItem: disableScheduleItem,
		getQueueList: getQueueList,
		getSunrise: getSunrise,
		getSunset: getSunset,
		getScheduleList: getScheduleList,
		updateScheduleItem: updateScheduleItem,
		removeScheduleItem: removeScheduleItem,
		getTimeline: getTimeline,
	};

	if (typeof(module) != 'undefined' && module.exports) {
    	// Publish as node.js module
    	loadSchedule();
    	generateQueue();
    	console.log('exports scheduleHandler');
    	module.exports = scheduleHandler;
	}
	
}).call(this);