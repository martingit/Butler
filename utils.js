(function() {

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

	if (typeof(module) != 'undefined' && module.exports) {
    	// Publish as node.js module
    	module.exports = utils;
	}
	
}).call(this);