var fs = require('fs');
module.exports = {
	settings: {
		httpServerPort: 3000,
		isPasswordProtected: false,
		isSecureServer: false,
		userName: "",
		userPassword: "",
		longitude: null,
		latitude: null,
	},
	load: function(){
	  try {
		var data = fs.readFileSync('./settings.json');
	    module.exports.settings = JSON.parse(data);
	  }
	  catch (err) {
	    console.log('There has been an error parsing your JSON.')
	    console.log(err);
	  }
	},
	save: function(newSettings){
		module.exports.settings = newSettings;
		var data = JSON.stringify(module.exports.settings);
		fs.writeFile('./settings.json', data, function (err) {
	    if (err) {
	      console.log('There has been an error saving your configuration data.');
	      console.log(err.message);
	      return;
	    }
	    console.log('Configuration saved successfully.')
	  });
	},
	get: function(){
		return module.exports.settings;
	}
};