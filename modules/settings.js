'use strict';
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
  load: function () {
    try {
      var data = fs.readFileSync('./settings.json');
      module.exports.settings = JSON.parse(data);
    } catch (err) {
      console.log('There has been an error parsing your JSON.')
      console.log(err);
    }
  },
  save: function (newSettings) {
    var settings = module.exports.settings;
    settings.httpServerPort = newSettings.httpServerPort;
    settings.isPasswordProtected = newSettings.isPasswordProtected;
    settings.userName = newSettings.userName;
    settings.userPassword = newSettings.userPassword;
    settings.longitude = newSettings.longitude;
    settings.latitude = newSettings.latitude;
    module.exports.settings = settings;

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
  get: function () {
    return module.exports.settings;
  }
};
