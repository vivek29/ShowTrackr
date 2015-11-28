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


Calling these methods invoke an $http with the specified http method, destination 
and parameters. When the data is returned from the server then the object is an 
instance of the resource class. 

It is important to realize that invoking a $resource object method immediately returns
an empty reference (object or array depending on isArray). Once the data is returned
from the server the existing reference is populated with the actual data. This is a 
useful trick since usually the resource is assigned to a model which is then rendered 
by the view. Having an empty object results in no rendering, once the data arrives 
from the server then the object is populated with the data and the view automatically 
re-renders itself showing the new data. This means that in most cases one never has to
write a callback function for the action methods.

*/