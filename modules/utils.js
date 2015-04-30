'use strict';
var utils = {
	addMinutes: function(date, minutes){
		var newDate = new Date(date.getTime());
		newDate.setMinutes(date.getMinutes()+minutes);
	    return newDate;
	},
	addHours: function(date, hours){
		var newDate = new Date(date.getTime());
		newDate.setHours(date.getHours()+hours);
	    return newDate;
	},
	addDays: function(date, days){
		var newDate = new Date(date.getTime());
		newDate.setDate(date.getDate()+days);
	    return newDate;
	}

};
module.exports = utils;
