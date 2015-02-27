var express = require('express');
var deviceRoute = require('./routes/device');
var settingsRoute = require('./routes/settings');
var scheduleRoute = require('./routes/schedule');
var queueRoute = require('./routes/queue');

var scheduleHandler = require('./handlers/schedule');
var settingsHandler = require('./handlers/settings');

var app = express();
module.exports = app;

app.use('/', express.static(__dirname + '/public'));
app.use('/device', deviceRoute);
app.use('/settings', settingsRoute);
app.use('/schedule', scheduleRoute);
app.use('/queue', queueRoute);

app.disable('etag');

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
  });
var settings = settingsHandler.get();
var server = app.listen(settings.httpServerPort, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);

});

function everySecond(){
	var date = new Date();
	if (date.getSeconds() == 0){
		console.log("New minute has arrived: " + date.getHours() + ":" + date.getMinutes());
	}
}

var interval = setInterval(everySecond, 1000);