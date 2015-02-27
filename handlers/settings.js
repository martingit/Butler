var fs = require('fs');
(function() {
	var settings = {
		httpServerPort: 3000,
		isPasswordProtected: false,
		isSecureServer: false,
		userName: "",
		userPassword: "",
		longitude: null,
		latitude: null,
	};
	function load(){
	  try {
		var data = fs.readFileSync('./settings.json');
	    settings = JSON.parse(data);
	  }
	  catch (err) {
	    console.log('There has been an error parsing your JSON.')
	    console.log(err);
	  }
	}
	function save(newSettings){
		settings = newSettings;
		var data = JSON.stringify(settings);
		fs.writeFile('./settings.json', data, function (err) {
	    if (err) {
	      console.log('There has been an error saving your configuration data.');
	      console.log(err.message);
	      return;
	    }
	    console.log('Configuration saved successfully.')
	  });
	}
	function get(){
		return settings;
	}

	var settingsHandler = {
		load: load,
		save: save,
		get: get,
	};

	if (typeof(module) != 'undefined' && module.exports) {
    	// Publish as node.js module
    	load();
    	console.log('exports settingsHandler');
    	module.exports = settingsHandler;
	}
	
}).call(this);