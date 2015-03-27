'use strict';

angular.module('butlerApp')
  .controller('HeaderCtrl', function ($scope, $location) {
    $scope.nodes = [{
      name: 'Home',
      url: '/',
      icon: 'glyphicon glyphicon-home'
    }, {
      name: 'Schedule',
      url: '/schedule',
      icon: 'glyphicon glyphicon-time'
    }, {
      name: 'Settings',
      url: '/settings',
      icon: 'glyphicon glyphicon-cog'
    }, {
      name: 'About',
      url: '/about',
      icon: 'glyphicon glyphicon-heart-empty'
    }, ];
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  })
  .directive('butlerHeader', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/header.html',
      controller: 'HeaderCtrl'
    };
  });
