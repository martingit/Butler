'use strict';

angular.module('butlerApp')
  .controller('SettingsCtrl', function ($scope, $http, $log, $timeout, $window, AppAlert) {

    $scope.address = '';

    var getSettings = function () {
      $http.get('/settings/')
        .success(function (response) {
          $scope.settings = response;
        }).error(function (response) {
          $log.error(response);
        });
    };

    $scope.getUserLocation = function () {
      $log.info('get user location');
      if (navigator.geolocation) {
        $log.info('user location available')
        navigator.geolocation.getCurrentPosition(function (position) {
          $log.info(position.coords);
          $scope.settings.longitude = position.coords.longitude;
          $scope.settings.latitude = position.coords.latitude;
          AppAlert.add('info', 'Geolocation retrieved from browser!', 2000);
          $scope.$apply();
        }, function (error) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              AppAlert.add('danger', 'User denied the request for Geolocation.', 3000);
              break;
            case error.POSITION_UNAVAILABLE:
              AppAlert.add('danger', 'Location information is unavailable.', 3000);
              break;
            case error.TIMEOUT:
              AppAlert.add('danger', 'The request to get user location timed out.', 3000);
              break;
            case error.UNKNOWN_ERROR:
              AppAlert.add('danger', 'An unknown error occurred.', 3000);
              break;
          }
        });
      }
    };

    $scope.saveSettings = function () {
      $log.info('saving settings');
      $http.post('/settings', $scope.settings).success(function (response) {
          AppAlert.add('success', 'Settings saved successfully!', 2000);
          $log.info(response);
        })
        .error(function (response) {
          $log.error(response);
          AppAlert.add('danger', response);
        });
    };

    $scope.reloadSettings = function () {
      getSettings();
      $scope.$apply();
    };

    $scope.getGeolocationFromAddress = function () {
      if ($scope.address.length === 0) {
        return;
      }
      var address = $scope.address;
      $log.info(address);
      var url = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false';
      $http.get(url).success(function (response) {
          if (response.status === 'OK' && response.results.length > 0) {
            $scope.settings.longitude = response.results[0].geometry.location.lng;
            $scope.settings.latitude = response.results[0].geometry.location.lat;
            $scope.address = response.results[0].formatted_address;
          }
        })
        .error(function (response) {
          $log.error(response);
          AppAlert.add('danger', response);
        });
    };
    $scope.restartServer = function () {
      var msg = 'Restart http server on port ' + $scope.settings.httpServerPort;
      $log.info(msg);
      AppAlert.add('warning', msg, 5000);
      var protocol = $scope.settings.isSecureServer ? 'https:' : 'http:';
      var newUrl = protocol + '//' + $window.location.hostname + ':' + $scope.settings.httpServerPort + '/';
      $http.put('/settings/restart').success(function (response) {
          $log.info(response);
          $timeout(function () {
            $window.location = newUrl;
          }, 2000, false);
        })
        .error(function (response) {
          $log.error(response);
        });
    };
    getSettings();
  });
