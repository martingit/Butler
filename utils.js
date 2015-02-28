(function() {
/*

Date.prototype.addHours = function (hours) {
	var dat = new Date(this.valueOf());
 	dat.setHours(dat.getHours()+hours);
    return dat;
}

Date.prototype.addMinutes = function (minutes) {
	var dat = new Date(this.valueOf());
 	dat.setMinutes(dat.getMinutes() + minutes);
    return dat;
}
Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}


*/
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