'use strict';
google.load('visualization', '1', {
  packages: ['timeline']
});

angular.module('butlerApp')
  .controller('QueueCtrl', function ($scope, $http, $log, AppAlert, socket) {
    socket.on('update:queue', function (response) {
      $scope.queues = response;
    });
    $scope.$on('$destroy', function () {
      socket.removeAllListeners('update:queue');
    });

    $scope.createTimeline = function () {
      $http.get('/schedule/timeline')
        .success(function (response) {
          $log.info(response);
          //return;
          if (response.items && response.items.length > 0) {
            var data = new google.visualization.DataTable();
            data.addColumn({
              type: 'string',
              id: 'Name'
            });
            data.addColumn({
              type: 'date',
              id: 'Start'
            });
            data.addColumn({
              type: 'date',
              id: 'End'
            });
            for (var i = 0; i < response.items.length; i++) {
              var timelineItem = response.items[i];
              data.addRow([timelineItem.deviceName, moment.utc(timelineItem.start).toDate(), moment.utc(timelineItem.end).toDate()]);
            }
            var options = {
              title: 'Timeline',
              enableInteractivity: true,
              timeline: {
                showRowLabels: true,
                singleColor: '#428BCA'
              },
              hAxis: {
                format: 'HH:mm'
              },
              is3D: true,
            };
            var chart = new google.visualization.Timeline(document.getElementById('timelineChart'));

            chart.draw(data, options);
          }
        }).error(function (response) {
          $log.error(response);
        });
    };
    //var intervalPromise;

    $scope.reloadQueues = function () {
      $log.info('reloading queues');

      $http.get('/queue/reload')
        .success(function (response) {
          $scope.queues = response.items;
        }).error(function (response) {
          $log.error(response);
          AppAlert.add('danger', response, 3000);
        });
    };
    $scope.loadQueues = function () {
      $log.info('loading queues');

      $http.get('/queue')
        .success(function (response) {
          $scope.queues = response.items;
        }).error(function (response) {
          $log.error(response);
          AppAlert.add('danger', 'Could not load queue. Stopping automatic reload timer.', 3000);
          if (intervalPromise) {
            $interval.cancel(intervalPromise);
          }
        });
    };
    $scope.$on('handleScheduleSaved', function () {
      $scope.loadQueues();
      $scope.createTimeline();
    });

    /*$scope.$on('$destroy', function() {
			if (intervalPromise) {
				$interval.cancel(intervalPromise);
			}
		});

		intervalPromise = $interval($scope.loadQueues, 10 * 1000);
*/
    $scope.loadQueues();
    $scope.createTimeline();
  });
