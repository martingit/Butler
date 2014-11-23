var UI = require('ui');
//var Settings = require('settings');
var Vibe = require('ui/vibe');
var Ajax = require('ajax');

var port = 8081;
var host = 'macmini.lan';
var useSsl = false;

var deviceList = [];

function baseHost() {
  var hostname = (useSsl ? 'https' : 'http') + '://' + host + ':' + port;
  return hostname;
}

var main = new UI.Card({
  title: 'Butler',
  subtitle: 'Loading device list',
  body: baseHost()
});
main.show();

var menu = new UI.Menu({
  sections: [{
    title: 'Butler Device List',
    items: []
  }]
});

function toggleDevice(index) {
  console.log('Clicked index: ' + index);
  if (deviceList.length === 0){
    return;
  }
  if (deviceList.length-1 < index){
    return;
  }
  var payload = {
    deviceId: deviceList[index].id,
    status: !deviceList[index].status
  };
  console.log('Toggling device: ' + deviceList[index].name + " with new status: " + payload.status);
  Ajax({ url: baseHost() + '/device/', type: 'json', method: 'post', data: payload }, 
      function(data) {
        console.log('device new status: ' + data.status);
        deviceList[index].status = data.status;
        Vibe.vibrate('short');
      },
      function(error){
        console.log('Could not toggle device: ' + error);
      });
}

function renderDeviceList(){
  var items = [];
  for(var i = 0; i < deviceList.length; i++){
    var device = deviceList[i];
    console.log('rendering item: ' + device.name);
    items[i] = { 
      title: device.name, 
      subtitle: 'status: ' + (device.status ? 'on' : 'off') 
    };
  }
  menu.items(0, items);
}

Ajax({ url: baseHost() + '/device/', type: 'json', method: 'get'},
  function(data) {
    console.log('Devices read: ' + data.devices.length);
    deviceList = data.devices;
    renderDeviceList();
    
    menu.show();
    main.hide();
  },
  function(error){
    console.log('Error fetching device list: ' + error);
  }
);

menu.on('select', function(e) {
  toggleDevice(e.itemIndex);
});

menu.show();

