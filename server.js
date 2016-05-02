var express = require('express');
var app = express();
var router = express.Router();
var path = require("path");
var _ = require('underscore');
var unirest = require('unirest');
var dynamoDB = require('./dynamoDB');
var config = require('./config');

/*
Check if the keys exist in the config.ja file. Else please paste them from keys file.
*/
if(config.accessKeyId == null || config.secretAccessKey == '' ||
config.secretAccessKey == null || config.secretAccessKey == '') {
  console.log('Please add accessKeyId and secretAccessKey to config.js file');
  process.exit();
}

/*
Sends the homepage of the website at the URL: localhost:5000/
*/
router.get('/', function(req, res) {
  res.sendfile(path.join(__dirname + '/home.html'));
});

app.use('/', router);

/*
Creating the server application using nodejs and express frameworks.
*/
var http = require('http').Server(app);
var server = http.listen(process.env.PORT || 5000, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});

/*
Creates a websocket io using socket.io module. Once a user connects to the server, a socket gets created. For each new connected user, the server sends the injection wells data for creating heatmap and live earthquakes data stored in DynamoDB to the client's browsers. This is done by invoking the fetchwells and fetchstream functions.
*/
var io = require('socket.io').listen(server);
io.on('connection', function(socket){
  console.log('a user connected');
  dynamoDB.fetchwells(socket);
  dynamoDB.fetchstream(io);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

/*
pollusgs method is invoked for every 1 hour time period. During each invocation, a get request is sent to http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson usgs url endpoint which fetches the last 1 hour earth quakes data around the world. For each earthquake data, we filter out the ones who are not in the boundaries of US. The filtered earthquakes are inserted into the DynamoDB through invocation of insertearthquake function. 
*/
var pollusgs = function () {
  unirest.get('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson')
    .end(function(response) {
        console.log(response.body);
        if(response.body != null && response.body.features != null) {
            _.each(response.body.features, function(feature) {
                if(feature != null && feature.geometry != null
                && feature.geometry.coordinates != null && feature.id != null
                && feature.properties.mag != null) {
                    console.log(JSON.stringify(feature));
                    var quake = {};
                    quake.id = feature.id;
                    quake.lon = feature.geometry.coordinates[0];
                    quake.lat = feature.geometry.coordinates[1];
                    quake.magnitude = feature.properties.mag;
                    var minlat = 24.313404, maxlat = 48.970369, minlon = -126.291737, maxlon = -51.804434;
                    if(minlat <= quake.lat && quake.lat <= maxlat &&
                      minlon <= quake.lon && quake.lon <= maxlon) {
                      console.log("quake: " + quake);
                      dynamoDB.insertearthquake(quake, io);
                    }
                }
            });
        }
    });
};

/*
Poll USGS for every 1 hour time interval
*/
setInterval(pollusgs, 60 * 60 * 1000);