angular.module('MyApp')
  .factory('Show', ['$resource', function($resource) {
    return $resource('/api/shows/:_id');
  }]);


  /*
{ 'get':    {method:'GET'},	-- to get a single show
  'save':   {method:'POST'},
  'query':  {method:'GET', isArray:true},  --  to get an array of shows.
  'remove': {method:'DELETE'},
  'delete': {method:'DELETE'} };

  */