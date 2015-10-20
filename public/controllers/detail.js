angular.module('MyApp')
  .controller('DetailCtrl', function($scope, $rootScope, $routeParams, Show, Subscription) {
      Show.get({ _id: $routeParams.id }, function(show) {
        $scope.show = show;

        $scope.isSubscribed = function() {
          return $scope.show.subscribers.indexOf($rootScope.currentUser._id) !== -1;
        };

        $scope.subscribe = function() {
          Subscription.subscribe(show).success(function() {
            $scope.show.subscribers.push($rootScope.currentUser._id);
          });
        };

        $scope.unsubscribe = function() {
          Subscription.unsubscribe(show).success(function() {
            var index = $scope.show.subscribers.indexOf($rootScope.currentUser._id);
            $scope.show.subscribers.splice(index, 1);
          });
        };

        // This nextEpisode property uses a built-in Javascript filter() method to find the next episode from today.
        // The filter() method creates a new array with all elements that pass the test implemented by the provided callback function. The show.episodes is an Array of all episodes for a Show, we know that. A filter() method goes through each and every episode and checks if it passes the following condition new Date(episode.firstAired) > new Date() and if it passes, that episode will be added to a new Array. At the end we will have either an empty Array (no upcoming shows) or potentially multiple episodes in an Array (multiple upcoming episodes). We are only interested in the first upcoming episode. And so that explains [0] at the end of the filter() method.
        $scope.nextEpisode = show.episodes.filter(function(episode) {
          return new Date(episode.firstAired) > new Date();
        })[0];
      });
    });
