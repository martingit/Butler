var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var scheduleModule = require('../modules/schedule');
var router = express.Router();

router.get('/', function (req, res) {
  res.send(scheduleModule.getQueueList());
});

router.get('/reload', function (req, res, next) {
  scheduleModule.generateQueue();
  res.send(scheduleModule.getQueueList());
});

module.exports = router;
