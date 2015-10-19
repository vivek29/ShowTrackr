angular.module('MyApp')
  .controller('AddCtrl', function($scope, $alert, Show) {
    $scope.addShow = function() { 
      Show.save({ showName: $scope.showName }).$promise         // the save method is provided by the $resource model defined in the Show service.
        .then(function() {                                           
          $scope.showName = '';
          $scope.addForm.$setPristine();        //  to clear the form of any errors after adding a Show. (no more $dirty)
          $alert({                             // $alert is part of  AngularStrap library.
            content: 'TV show has been added.',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .catch(function(response) {
          $scope.showName = '';
          $scope.addForm.$setPristine();
          $alert({
            content: response.data.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
    };
  });


// This controller sends a POST request to /api/shows with the TV show name.
// If the request has been successfull, the form is cleared and a successful notification is shown.
