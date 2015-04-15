'use strict';

angular.module('butlerApp')
  .controller('DeviceCtrl', function($scope, $filter, $http, $log, socket, AppAlert) {
    var orderBy = $filter('orderBy');
    $scope.order = function(predicate, reverse) {
      $scope.devices = orderBy($scope.devices, predicate, reverse);
    };
    
    socket.on('update:device', function(response){
      angular.forEach($scope.devices, function(device) {
          if (device.id === response.id){
            $log.info('updating device');
            device.status = response.status;
            device.level = response.level;
          }
        });
    });
    $scope.$on('$destroy', function () {
        socket.removeAllListeners('update:device');
    });
    $http.get('/device/')
      .success(function(response) {
        $scope.devices = response.devices;
        $scope.order('id',false);
      }).error(function(response) {
        $log.error(response);
        AppAlert.add('danger', response, 2000);
      });
    $scope.dimLevels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    $scope.changeStatus = function(deviceId, status) {
      angular.forEach($scope.devices, function(device) {
        if (device.id === deviceId) {
          var url = '/device/';
          $http.post(url, {
            'status': status,
            'deviceId': deviceId
          }).success(function(response) {
            device.status = response.status;
            /*if (device.status)  {
              AppAlert.add('info', 'Turned on device ' + device.name, 2000);
            } else {
              AppAlert.add('info', 'Turned off device ' + device.name, 2000);
            }*/
          }).error(function(response) {
            $log.error(response);
            AppAlert.add('danger', response, 2000);
          });
          return;
        }
      });
    };
    $scope.turnAllOff = function() {
      angular.forEach($scope.devices, function(device) {
        var url = '/device/';
        $http.post(url, {
          status: false,
          'deviceId': device.id
        }).success(function(response) {
          device.status = response.status;
        }).error(function(response) {
          $log.error(response);
          AppAlert.add('danger', response, 2000);
        });
      });
      AppAlert.add('info', 'Turned off all devices', 2000);
    };
    $scope.turnAllOn = function() {
      angular.forEach($scope.devices, function(device) {
        var url = '/device/';
        $http.post(url, {
          status: true,
          'deviceId': device.id
        }).success(function(response) {
          device.status = response.status;
        }).error(function(response) {
          $log.error(response);
          AppAlert.add('danger', response, 2000);
        });
      });
      AppAlert.add('info', 'Turned on all devices', 2000);
    };
    $scope.dimDevice = function(deviceId, level) {
      $log.info('Device: ' + deviceId + ' Level: ' + level);
      angular.forEach($scope.devices, function(device) {
        if (device.id === deviceId) {
          var url = '/device/';
          $http.put(url, {
            'level': level,
            'deviceId': deviceId
          }).success(function(response) {
            device.status = response.status;
            device.level = response.level;
            //AppAlert.add('info', 'Dimmed ' + device.name + ' to ' + device.level + '%', 2000);
          }).error(function(response) {
            $log.error(response);
            AppAlert.add('danger', response, 2000);
          });
          return;
        }
      });
    };
    $scope.reloadDevices = function() {
      $http.get('/device/reload')
        .success(function(response) {
          $scope.devices = response.devices;
        }).error(function(response) {
          $log.error(response);
          AppAlert.add('danger', response, 2000);
        });
    };
  })
  .directive('deviceList', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/deviceList.html',
      controller: 'DeviceCtrl',
    };
  });
