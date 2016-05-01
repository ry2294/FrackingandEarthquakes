var express = require('express');
var app = express();
var router = express.Router();
var path = require("path");
var _ = require('underscore');
var unirest = require('unirest');
var dynamoDB = require('./dynamoDB');

router.get('/', function(req, res) {
  res.sendfile(path.join(__dirname + '/home.html'));
});

app.use('/', router);

var http = require('http').Server(app);
var server = http.listen(process.env.PORT || 5000, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

var io = require('socket.io').listen(server);
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

unirest.get('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson')
    .end(function(response) {
        if(response.body != null && response.body.features != null)
            _.each(response.body.features, function(feature) {
                if(feature != null && feature.geometry != null
                && feature.geometry.coordinates != null && feature.id != null
                && feature.properties.mag != null) {
                    var earthquake = {};
                    earthquake.id = feature.id;
                    earthquake.lon = feature.geometry.coordinates[0];
                    earthquake.lat = feature.geometry.coordinates[1];
                    earthquake.magnitude = feature.properties.mag;
                    console.log("earthquake: " + earthquake);
                    dynamoDB.insertearthquake(earthquake);
                }
            });
    });