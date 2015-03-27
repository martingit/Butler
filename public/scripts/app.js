'use strict';

angular.module('butlerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        title: 'Butler',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        title: 'About',
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/schedule', {
        title: 'Schedule',
        templateUrl: 'views/schedule.html',
        controller: 'ScheduleCtrl'
      })
      .when('/settings', {
        title: 'Settings',
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(['$location', '$rootScope',
    function ($location, $rootScope) {
      $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
      });
    }
  ])
  .directive('scheduleList', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/scheduleList.html',
      controller: 'ScheduleCtrl',
    };
  })
  .directive('queueList', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/queueList.html',
      controller: 'QueueCtrl',
    };
  })
  .directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });
          event.preventDefault();
        }
      });
    };
  }).factory('AppAlert', ['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
      var alertService;
      $rootScope.alerts = [];
      return alertService = {
        add: function (type, msg, timeout) {
          var alert = {
            type: type,
            msg: msg,
            close: function () {
              return alertService.closeAlert(this);
            }
          };
          $rootScope.alerts.push(alert);
          if (timeout) {
            $timeout(function () {
              alertService.closeAlert(alert);
            }, timeout);
          }
        },
        closeAlert: function (alert) {
          return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
        },
        closeAlertIdx: function (index) {
          return $rootScope.alerts.splice(index, 1);
        }
      };
    }
  ]).factory('socket', ['$rootScope', 'AppAlert', function ($rootScope, AppAlert) {
    var socket = io.connect();
    socket.on('alert', function (data) {
      AppAlert.add(data.type, data.msg, 2000);
    });
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      removeAllListeners: function (eventName) {
        console.log('removing listeners for ' + eventName);
        socket.removeAllListeners(eventName);
      }
    };
  }]);
