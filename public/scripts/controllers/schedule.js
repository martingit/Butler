'use strict';

angular.module('butlerApp')
  .controller('ScheduleCtrl', function ($scope, $http, $rootScope, $log, AppAlert, socket) {
    $scope.schedules = undefined;
    $scope.timeTypes = [{
      value: 0,
      name: 'Absolute'
    }, {
      value: 1,
      name: 'Sunrise +'
    }, {
      value: 2,
      name: 'Sunrise -'
    }, {
      value: 3,
      name: 'Sunset +'
    }, {
      value: 4,
      name: 'Sunset -'
    }, ];
    $scope.actions = [{
      value: true,
      name: 'On'
    }, {
      value: false,
      name: 'Off'
    }];

    var initNewSchedule = function () {
      $scope.newSchedule = {
        id: '',
        deviceId: null,
        timeTypeId: 0,
        time: null,
        action: true,
        enabled: true,
      };
    };
    var broadcastScheduleSaved = function () {
      $rootScope.$broadcast('handleScheduleSaved');
    };

    //scope.queues = [];

    $scope.reloadSchedule = function (onlySchedule) {
      $log.info('reloading schedule and devices');
      if (!onlySchedule) {
        $http.get('/device/')
          .success(function (response) {
            $scope.devices = response.devices;
          }).error(function (response) {
            $log.error(response);
          });
      }
      $http.get('/schedule/')
        .success(function (response) {
          $log.info(response);
          $scope.schedules = response.items;
        }).error(function (response) {
          $log.error(response);
        });
    };

    var validateTime = function (time) {
      var timeRegEx = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegEx.test(time)) {
        AppAlert.add('danger', 'Please enter time in correct format (hh:mm)', 3000);
        return false;
      }
      return true;
    }

    $scope.add = function () {
      if (!$scope.newSchedule.deviceId) {
        AppAlert.add('danger', 'Please select a device', 3000);
        return;
      }
      // if (!$scope.newSchedule.time) {
      // 	AppAlert.add('danger', 'Please select a time', 3000);
      // 	return;
      // }
      if (!validateTime($scope.newSchedule.time)) {
        return;
      }
      var url = '/schedule';
      $http.put(url, $scope.newSchedule).success(function (response) {
          $log.info(response);
          $scope.schedules.push(response);
          initNewSchedule();
          broadcastScheduleSaved();
        })
        .error(function (response) {
          $log.error(response);
        });
    };

    $scope.update = function (itemId) {
      var scheduleIndex = -1;
      for (var i = 0; i < $scope.schedules.length; i++) {
        if ($scope.schedules[i].id === itemId) {
          scheduleIndex = i;
        }
      }
      if (scheduleIndex === -1) {
        return;
      }
      var url = '/schedule/';
      var scheduleItem = $scope.schedules[scheduleIndex];
      if (!validateTime(scheduleItem.time)) {
        return;
      }
      $http.post(url, scheduleItem).success(function (response) {
          $log.info(response);
          $scope.schedules[scheduleIndex].dirty = null;
          broadcastScheduleSaved();
        })
        .error(function (response) {
          $log.error(response);
        });
    };
    $scope.delete = function (itemId) {
      $log.info('delete item ' + itemId);
      var url = '/schedule/' + itemId;
      var scheduleIndex = -1;
      for (var i = 0; i < $scope.schedules.length; i++) {
        if ($scope.schedules[i].id === itemId) {
          scheduleIndex = i;
        }
      }
      $log.info('index:' + scheduleIndex);
      $http.delete(url).success(function (response) {
          $log.info(response);
          $scope.schedules.splice(scheduleIndex, 1);
          broadcastScheduleSaved();
        })
        .error(function (response) {
          $log.error(response);
        });
    };
    $scope.saveAll = function () {
      $log.info('save all');
      for (var i = 0; i < $scope.schedules.length; i++) {
        if ($scope.schedules[i].dirty) {
          $scope.update($scope.schedules[i].id);
        }
        $scope.$apply();
      }
    };
    initNewSchedule();
    $scope.reloadSchedule(false);

  });
