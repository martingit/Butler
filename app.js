var express = require('express');
var https = require('https');
var pem = require('pem');
var auth = require('basic-auth');
var shelljs = require('shelljs');

var deviceRoute = require('./routes/device');
var settingsRoute = require('./routes/settings');
var scheduleRoute = require('./routes/schedule');
var queueRoute = require('./routes/queue');

var scheduleModule = require('./modules/schedule');
var settingsModule = require('./modules/settings');
var deviceModule = require('./modules/device');
var timerModule = require('./modules/timer');

var app = express();
module.exports = app;

var isProcessing = false;
var isWorking = false;
var workerQueue = [];

settingsModule.load();
  

app.use(function(req, res, next) {
  var settings = settingsModule.settings;
  var host = req.headers.host;
  var hostName = host.substring(0, host.indexOf(':'));
  if (settings.isPasswordProtected && hostName != '127.0.0.1' && hostName != 'localhost' && settings.userName && settings.userPassword){
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


app.post('/settings/hook', function(req, res){
  console.log('github webhook. updating local environment.')
  res.send('thank you');
  setTimeout(restart, 30);
});


app.disable('etag');

var server;

app.put('/settings/restart', function(req,res,next){
  server.close();
  startServer();
  res.send({status: "Restarting server;"});
});
function restart() {
  shelljs.exec('git pull');
  shelljs.exec('npm install');
  shelljs.exec('sh ./restart.sh');
}
function startServer(){
  console.log('starting. v1.1');
  deviceModule.refreshDevices();
  scheduleModule.loadSchedule();
  scheduleModule.generateQueue();
  var settings = settingsModule.settings;
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

timerModule.run();

startServer();
