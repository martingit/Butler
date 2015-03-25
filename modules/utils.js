var utils = {
	addMinutes: function(date, minutes){
		date.setMinutes(date.getMinutes()+minutes);
	    return date;
	},
	addHours: function(date, hours){
		date.setHours(date.getHours()+hours);
	    return date;
	},
	addDays: function(date, days){
		date.setDate(date.getDate()+days);
	    return date;
	}
};
module.exports = utils;
