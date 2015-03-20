var deviceModule = require('./device');
var settingsModule = require('./settings');
var utils = require('../utils');
var uuid = require('node-uuid');
var suncalc = require('suncalc');

var fs = require('fs');

var TimeType = {
	AbsoluteTime: 0,
	SunrisePlus: 1,
	SunriseMinus: 2,
	SunsetPlus: 3,
	SunsetMinus: 4,
};
function getSunrise(){
	var settings = settingsModule.settings;
	var times = suncalc.getTimes(new Date(), settings.latitude, settings.longitude);
	return times.sunrise;
}
function getSunset(){
	var settings = settingsModule.settings;
	var times = suncalc.getTimes(new Date(), settings.latitude, settings.longitude);
	return times.sunset;
}

module.exports = {
	scheduleList: [],
	queueList: [],
	timeline: [],
	generateQueue: function() {
		var now = new Date();
		console.log(now + ' generating queue')
		var list = [];
		var sortedList = this.scheduleList.sort(module.exports.timeCompare);
		for (var i = 0; i < sortedList.length; i++) {
        	var item = sortedList[i];
        	if (item.enabled){
        		var queueItem = {
        			id: uuid.v4(),
        			scheduleId: item.id,
        			deviceId: item.deviceId,
        			deviceName: deviceModule.getName(item.deviceId),
        			action: item.action,
        			actionName: module.exports.getActionName(item.action),
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
        			var isValidWeekday = module.exports.isMatchingWeekdays(item, queueItem.when);
        			addToQueue = isValidWeekday;
        		} 

        		if(addToQueue){
					list.push(queueItem);
        		}
        	}
    	}
    	module.exports.queueList = list.sort(module.exports.whenCompare);
	},
	addScheduleItem: function (item){
		item.id = uuid.v4();
		item.dirty = false;
		module.exports.scheduleList.push(item);
		module.exports.saveSchedule();
		return item;
	},

	loadSchedule: function(){
	  try {
		var data = fs.readFileSync('./schedule.json');
	    module.exports.scheduleList = JSON.parse(data);
	  }
	  catch (err) {
	    console.log('There has been an error parsing your JSON.')
	    console.log(err);
	  }
	},

	saveSchedule: function(){
		var data = JSON.stringify(module.exports.scheduleList);
		fs.writeFile('./schedule.json', data, function (err) {
	    if (err) {
	      console.log('There has been an error saving your schedule data.');
	      console.log(err.message);
	      return;
	    }
	    console.log('Schedule saved successfully.')
	    module.exports.generateQueue();
	  });
	},

	updateScheduleItem: function(item){
		for (var i = module.exports.scheduleList.length - 1; i >= 0; i--) {
			if(module.exports.scheduleList[i].id === item.id){
				item.dirty = false;
				module.exports.scheduleList[i] = item;
				module.exports.saveSchedule();
				return item;
			}
		}
		return null;
	},

	removeScheduleItem: function(itemId){
		for (var i = module.exports.scheduleList.length - 1; i >= 0; i--) {
			if(module.exports.scheduleList[i].id === itemId){
				module.exports.scheduleList.splice(i, 1);
				module.exports.saveSchedule();
				return;
			}
		}
	},
	getActionName: function(action){
		return action ? "Turn On" : "Turn Off";
	},
	isMatchingWeekdays: function(scheduleItem, dateToMatch){
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
	},

	disableScheduleItem: function(id){
		for (var i = module.exports.scheduleList.length - 1; i >= 0; i--) {
			if(module.exports.scheduleList[i].id === id){
				module.exports.scheduleList[i].enabled = false;
				return;
			}
		}

	},
	getQueueList: function(){
		return {items: module.exports.queueList};
	},
	getScheduleList: function(){
		return {items: module.exports.scheduleList};
	},
	getTimeline: function(){
		return module.exports.timeline;
	},
	timeCompare: function(a,b) {
		var first = Date.parse("1900-01-01 " + a.time);
		var second = Date.parse("1900-01-01 " + b.time);
		if (first < second){
			return -1;
		}
		if (first > second){
			return 1;
		}
		return 0;
	},
	whenCompare: function(a,b) {
		var first = a.when;
		var second = b.when;
		if (first < second){
			return -1;
		}
		if (first > second){
			return 1;
		}
		return 0;
	},
};