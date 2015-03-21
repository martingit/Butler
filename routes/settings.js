var express = require('express');
var telldus = require('telldus');
var bodyParser = require('body-parser');
var fs = require('fs');
var settingsModule = require('../modules/settings');

var router = express.Router();
var jsonParser = bodyParser.json();
function restart(){
	var spawn = require('child-process').spawn;
	var deploySh = spawn('sh', [ '../restart.sh' ]);
}
router.get('/', function (req,res){
	res.send(settingsModule.get());
});

router.post('/', jsonParser, function(req,res,next){
	settingsModule.save(req.body);
});

router.get('/hook', function(req,res){
	console.log('received webhook. updating local envifonment')
	res.send('thank you');
	setTimeout(restart, 30);
});

module.exports = router;