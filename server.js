var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');


var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('lodash');

// Show schema- only representation of the data in MongoDB
var showSchema = new mongoose.Schema({
  _id: Number,				// overrides the default _id
  name: String,
  airsDayOfWeek: String,
  airsTime: String,
  firstAired: Date,
  genre: [String],
  network: String,
  overview: String,
  rating: Number,
  ratingCount: Number,
  status: String,
  poster: String,
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'	// an array of references to User schema(documents)
  }],
  episodes: [{
    season: Number,
    episodeNumber: Number,
    episodeName: String,
    firstAired: Date,
    overview: String
  }]
});

// User schema
var userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  facebook: {
    id: String,
    email: String
  },
  google: {
    id: String,
    email: String
  }
});

// password hashing middleware -- before saving in userSchema
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();	// only hash the password if it has been modified (or is new)
  
  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// password verification  
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// mongoose models
var User = mongoose.model('User', userSchema);
var Show = mongoose.model('Show', showSchema);

// connecting to the database
mongoose.connect('localhost');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// API Route
app.get('/api/shows', function(req, res, next) {
  var query = Show.find();
  if (req.query.genre) {
    query.where({ genre: req.query.genre });		// query by genre
  } else if (req.query.alphabet) {
    query.where({ name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') });	// Matches any string starting with that alphabet and i (modifier) for case-insensitive
  } else {
    query.limit(12);	// Specifies the maximum number of shows(12) the query will return
  }
  // execute the query at a later time
  query.exec(function(err, shows) {
    if (err) return next(err);
    res.send(shows);			// respond with the queried shows
  });
});

// API Route
app.get('/api/shows/:id', function(req, res, next) {

  // search by the id (get from request object params)
  Show.findById(req.params.id, function(err, show) {
    if (err) return next(err);
    res.send(show);				// respond with the specific show
  });
});


// API Route - Query and Parse The TVDB API -- To add a new TV show to the database 
app.post('/api/shows', function (req, res, next) {
  var seriesName = req.body.showName
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');

  // API key from TVDB
  var apiKey = '9EF1D1E7D28FDA0B';

  // xml2js - Simple XML to JavaScript object converter
  // Parser to normalize all tags to lowercase and disable conversion to arrays when there is only one child element
  var parser = xml2js.Parser({
    explicitArray: false,
    normalizeTags: true
  });


/* Here;s how async.waterfall works - 
1. Get the Show ID given the Show Name and pass it on to the next function.
2. Get the show information using the Show ID from previous step and pass the new show object on to the next function.
3. Convert the poster image to Base64, assign it to show.poster and pass the show object to the final callback function.
4. Save the show object to database.
*/
  // Managing multiple aynsc operations
  async.waterfall([
    function (callback) {
      request.get('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, function (error, response, body) {
        if (error) return next(error);
        parser.parseString(body, function (err, result) {
          if (!result.data.series) {
            return res.send(400, { message: req.body.showName + ' was not found.' });
          }
          var seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
          callback(err, seriesId);
        });
      });
    },
    function (seriesId, callback) {
      request.get('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml', function (error, response, body) {
        if (error) return next(error);
        parser.parseString(body, function (err, result) {
          var series = result.data.series;
          var episodes = result.data.episode;
          var show = new Show({
            _id: series.id,
            name: series.seriesname,
            airsDayOfWeek: series.airs_dayofweek,
            airsTime: series.airs_time,
            firstAired: series.firstaired,
            genre: series.genre.split('|').filter(Boolean),
            network: series.network,
            overview: series.overview,
            rating: series.rating,
            ratingCount: series.ratingcount,
            runtime: series.runtime,
            status: series.status,
            poster: series.poster,
            episodes: []
          });
          _.each(episodes, function (episode) {			// using lodash dependency
            show.episodes.push({
              season: episode.seasonnumber,
              episodeNumber: episode.episodenumber,
              episodeName: episode.episodename,
              firstAired: episode.firstaired,
              overview: episode.overview
            });
          });
          callback(err, show);
        });
      });
    },
    function (show, callback) {
      var url = 'http://thetvdb.com/banners/' + show.poster;
      request({ url: url, encoding: null }, function (error, response, body) {
        show.poster = 'data:' + response.headers['content-type'] + ';base64,' + body.toString('base64');
        callback(error, show);
      });
    }
  ], function (err, show) {
    if (err) return next(err);
    show.save(function (err) {
      if (err) {
        if (err.code == 11000) {
          return res.send(409, { message: show.name + ' already exists.' });
        }
        return next(err);
      }

      var alertDate = Date.create('Next ' + show.airsDayOfWeek + ' at ' + show.airsTime).rewind({ hour: 2});
      agenda.schedule(alertDate, 'send email alert', show.name).repeatEvery('1 week');
      
      res.send(200);
    });
  });
});










// Redirect other routes to original url
app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});


// Error middleware -  When an error occurs a stack trace is output in the console and JSON response is returned with the error message
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, { message: err.message });
});


app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});