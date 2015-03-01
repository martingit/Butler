var express = require('express');
var https = require('https');
var pem = require('pem');
var auth = require('basic-auth');
var deviceRoute = require('./routes/device');
var settingsRoute = require('./routes/settings');
var scheduleRoute = require('./routes/schedule');
var queueRoute = require('./routes/queue');

var scheduleHandler = require('./handlers/schedule');
var settingsHandler = require('./handlers/settings');
var deviceHandler = require('./handlers/device');

var app = express();
module.exports = app;

var isProcessing = false;
var isWorking = false;
var workerQueue = [];


app.use(function(req, res, next) {
  var settings = settingsHandler.get();
  if (settings.isPasswordProtected){
    var credentials = auth(req)

    if (!credentials || credentials.name !== settings.userName || credentials.pass !== settings.userPassword) {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="buttlejs"'
      })
      return res.end('OH no you didnt?!');
    } else {
      return next();
    }
  }
  return next();
});

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});

app.use('/', express.static(__dirname + '/public'));
app.use('/device', deviceRoute);
app.use('/settings', settingsRoute);
app.use('/schedule', scheduleRoute);
app.use('/queue', queueRoute);

app.disable('etag');

var server;

app.put('/settings/restart', function(req,res,next){
  server.close();
  startServer();
  res.send({status: "Restarting server;"});
});

function startServer(){
  var settings = settingsHandler.get();
  if (settings.isSecureServer){
    pem.createCertificate({days:1000, selfSigned:true}, function(err, keys){  
      server = https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(settings.httpServerPort);
      var host = server.address().address;
      var port = server.address().port;
      console.log('Listening at https://%s:%s', host, port);
    });
  } else {
      server = app.listen(settings.httpServerPort, function () {

      var host = server.address().address;
      var port = server.address().port;

      console.log('Listening at http://%s:%s', host, port);

    });
  }
}

function everySecond(){
  if (isProcessing){
    console.log("Processing already in progress. I'll check again in a minute");
    return;
  }
	var date = new Date();
	if (date.getSeconds() != 0){
    return;
	}
  date.setMilliseconds(0);
  //console.log("New minute has arrived: " + date.getHours() + ":" + date.getMinutes());
  isProcessing = true;

  var queueList = scheduleHandler.getQueueList().items;
  if (queueList.length == 0){
    //console.log("No queue found. Trying to generate new")
    scheduleHandler.generateQueue();
    queueList = scheduleHandler.getQueueList().items;
  }
  var workAdded = false;
  //console.log('Found ' + queueList.length + 'items to process');
  for (var i = queueList.length - 1; i >= 0; i--) {
    if (queueList[i].when.getTime() === date.getTime()){
      var workerItem = {
        deviceId: queueList[i].deviceId,
        action: queueList[i].action,
        level: 0,
        actionName: queueList[i].actionName,
        deviceName: queueList[i].deviceName,
      };
      if (!queueList[i].isRecurring){
        scheduleHandler.disableScheduleItem(queueList[i].scheduleId);
      }
      workerQueue.push(workerItem);
      workAdded = true;
    }
  };
  if(workAdded){
    scheduleHandler.generateQueue();
    console.log('work added to queue');
  }
  //console.log("Finished processing queue.");
  isProcessing = false;
}

function processWorkerQueue(){
  if (isWorking || workerQueue.length === 0){
    return;
  }
  isWorking = true;
  console.log(workerQueue[0].actionName + " " + workerQueue[0].deviceName);
  deviceHandler.updateDeviceStatus(workerQueue[0].deviceId, workerQueue[0].action, 0);
  workerQueue.splice(0,1);
  isWorking = false;
}

var everySecondInterval = setInterval(everySecond, 1000);
var processWorkerQueueInterval = setInterval(processWorkerQueue, 300);

startServer();
