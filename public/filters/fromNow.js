angular.module('MyApp').
  filter('fromNow', function() {
    return function(date) {
      return moment(date).fromNow();
    }
  });


// It uses moment.js library to output a friendly date like in 6 hours or in 5 days.

