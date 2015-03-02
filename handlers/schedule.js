var deviceHandler = require('./device');
var settingsHandler = require('./settings');
var utils = require('../utils');
var uuid = require('node-uuid');
var suncalc = require('suncalc');

var fs = require('fs');


(function() {
//var schedule = {items:[{"id":"C9996576-3FD2-430D-9871-AC2E810250A3","sunday":true,"saturday":true,"thursday":true,"time":"01:00","deviceId":6,"friday":true,"timeTypeId":4,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"C4E2A5FC-7456-4AD1-B068-C701F6E3E958","sunday":true,"saturday":true,"thursday":true,"time":"01:15","deviceId":6,"friday":true,"timeTypeId":3,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"E8D33996-5F20-41FA-996C-FF858D412897","sunday":true,"saturday":true,"thursday":true,"time":"06:30","deviceId":10,"friday":true,"timeTypeId":0,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"A95888E7-D223-425E-855D-DBBD191BB818","sunday":true,"saturday":true,"thursday":true,"time":"08:00","deviceId":10,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"9D404768-F26B-424E-BB0D-86BFE8CED7C9","sunday":false,"saturday":false,"thursday":true,"time":"06:55","deviceId":2,"friday":true,"timeTypeId":0,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"83873445-938A-4232-841A-3622740C69F1","sunday":false,"saturday":false,"thursday":true,"time":"08:00","deviceId":2,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"7A498832-0882-4523-84D4-44943F3CFCB3","sunday":true,"saturday":true,"thursday":true,"time":"01:00","deviceId":2,"friday":true,"timeTypeId":4,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"5FA08B0F-471B-4225-9730-6DE8FA7DD4EB","sunday":true,"saturday":true,"thursday":true,"time":"22:00","deviceId":2,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"BE140A61-8BFB-4950-8DD2-5F1CE8FDFAEB","sunday":true,"saturday":true,"thursday":true,"time":"01:00","deviceId":12,"friday":true,"timeTypeId":4,"action":true,"enabled":false,"monday":true,"tuesday":true,"wednesday":true},{"id":"132DAABD-6361-4D2C-99A8-B2C27FF97E7D","sunday":true,"saturday":true,"thursday":true,"time":"22:00","deviceId":12,"friday":true,"timeTypeId":0,"action":false,"enabled":false,"monday":true,"tuesday":true,"wednesday":true}]};
	var TimeType = {
		AbsoluteTime: 0,
		SunrisePlus: 1,
		SunriseMinus: 2,
		SunsetPlus: 3,
		SunsetMinus: 4,
	};


	var schedule = { items: [] };
	var queueList = [];
	var timeline = [];

	function addScheduleItem(item){
		item.id = uuid.v4();
		item.dirty = false;
		schedule.items.push(item);
		saveSchedule();
		return item;
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
	    generateQueue();
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

	function generateQueue() {
		var now = new Date();
		var list = [];
		var sortedList = schedule.items.sort(timeCompare);
		for (var i = 0; i < sortedList.length; i++) {
        	var item = sortedList[i];
        	if (item.enabled){
        		var queueItem = {
        			id: uuid.v4(),
        			scheduleId: item.id,
        			deviceId: item.deviceId,
        			deviceName: deviceHandler.getName(item.deviceId),
        			action: item.action,
        			actionName: getActionName(item.action),
        		};

        		var hours = parseInt(item.time.substring(0,2));
        		var minutes = parseInt(item.time.substring(3));
        		var date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        		//console.log("date: " + date);

        		switch (item.timeTypeId){
        			case TimeType.SunrisePlus:
        				date = utils.addHours(getSunrise(), hours);
        				date = utils.addMinutes(date, minutes);
        				break;
	                case TimeType.SunriseMinus:
	                    date = utils.addHours(getSunrise(), -hours)
        				date = utils.addMinutes(date, -minutes);
        				break;
	                case TimeType.SunsetPlus:
	                    date = utils.addHours(getSunset(), hours);
        				date = utils.addMinutes(date, minutes);
        				break;
	                case TimeType.SunsetMinus:
	                    date = utils.addHours(getSunset(), -hours);
        				date = utils.addMinutes(date, -minutes);
        				break;
        			case TimeType.AbsoluteTime:
                	default:
                    	break;
        		}
        		if (now > date) {
        			date = utils.addDays(date, 1);
        		}
        		queueItem.when = date;
        		queueItem.isRecurring = item.monday || item.tuesday || item.wednesday || item.thursday || item.friday || item.saturday || item.sunday;
        		var addToQueue = true;
        		if (queueItem.isRecurring) {
        			var isValidWeekday = isMatchingWeekdays(item, queueItem.when);
        			addToQueue = isValidWeekday;
        		} 

        		if(addToQueue){
					list.push(queueItem);
        		}
        	}
    	}
    	queueList = list.sort(whenCompare);
	}

	function getActionName(action){
		return action ? "Turn On" : "Turn Off";
	}
	function isMatchingWeekdays(scheduleItem, dateToMatch){
		var weekday = dateToMatch.getDay();
		if (weekday === 1 && scheduleItem.monday){
	        return true;
	    }
	    if (weekday === 2 && scheduleItem.tuesday){
	        return true;
	    }
	    if (weekday === 3 && scheduleItem.wednesday){
	        return true;
	    }
	    if (weekday === 4 && scheduleItem.thursday){
	        return true;
	    }
	    if (weekday === 5 && scheduleItem.friday){
	        return true;
	    }
	    if (weekday === 6 && scheduleItem.saturday){
	        return true;
	    }
	    if (weekday === 0 && scheduleItem.sunday){
	        return true;
	    }
	    return false;
	}

	function disableScheduleItem(id){
		for (var i = schedule.items.length - 1; i >= 0; i--) {
			if(schedule.items[i].id === id){
				schedule.items[i].enabled = false;
				return;
			}
		}

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
	function timeCompare(a,b) {
		var first = Date.parse("1900-01-01 " + a.time);
		var second = Date.parse("1900-01-01 " + b.time);
		if (first < second){
			return -1;
		}
		if (first > second){
			return 1;
		}
		return 0;
	}
	function whenCompare(a,b) {
		var first = a.when;
		var second = b.when;
		if (first < second){
			return -1;
		}
		if (first > second){
			return 1;
		}
		return 0;
	}
	var scheduleHandler = {
		addScheduleItem: addScheduleItem,
		generateQueue: generateQueue,
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