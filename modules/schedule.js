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
function whenCompare (a,b) {
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
function nameThenWhenComare(a,b){
	var firstName = a.deviceName;
	var firstWhen = a.when;
	var secondName = b.deviceName;
	var secondWhen = b.when;
	if (firstName < secondName){
		return -1;
	}
	if (firstName > secondName){
		return 1;
	}
	if (firstWhen < secondWhen){
		return -1;
	}
	if (firstWhen > secondWhen){
		return 1;
	}
	return 0;
}
module.exports = {
	scheduleList: [],
	queueList: [],
	timeline: [],
	generateQueue: function() {
		var now = new Date();
		console.log(now + ' generating queue')
		var list = [];
		var sortedList = this.scheduleList.sort(timeCompare);
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
    	module.exports.generateTimeline();
    	module.exports.queueList = list.sort(whenCompare);
	},
	generateTimeline: function(){
		var queue = module.exports.queueList.sort(nameThenWhenComare);
		var list = [];
		var minDate = Date.parse('2500-01-01 24:59');
		var maxDate = Date.parse('1900-01-01 00:00');
		for (var i = 0; i < queue.length; i++){
			var item = queue[i];
			var updatedItem = false;
			for (var j = 0; j < list.length; j++){
				var timelineItem = list[j];
				if (timelineItem.deviceId === item.deviceId){
					if (timelineItem.end === undefined && !item.action){
	                    timelineItem.end = item.when;
	                    updatedItem = true;
	                }
				}
			}
			if (!updatedItem) {
				var timeline = { deviceId: item.deviceId, deviceName: item.deviceName, end: undefined, start: undefined };
				if (item.action){
                	timeline.start = item.when;
				}	else {
					timeline.end = item.when;
				}
				list.push(timeline);
			}
			if (minDate > item.when) {
				minDate = item.when;
			}
			if (maxDate < item.when) {
				maxDate = item.when;
			}
		}
		for (var i = list.length - 1; i >= 0; i--) {
			var timelineItem = list[i];
			if (timelineItem.start === undefined){
				timelineItem.start = new Date();
			}
			if (timelineItem.end === undefined){
				timelineItem.end = maxDate;
			}
		};
		module.exports.timeline = {items: list};
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
	    var schedule = JSON.parse(data);
	    if (schedule.items){
	    	schedule = schedule.items;
	    }
	    module.exports.scheduleList = schedule;
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

};