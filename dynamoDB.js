var _ = require('underscore');
var AWS = require('aws-sdk');
var pg = require('pg');
var config = require('./config');

var conString = "postgres://rakesh891:!QAZ2wsx@postgresserver.cvti2cxbktmb.us-west-2.rds.amazonaws.com/postgres";

AWS.config.update({
    accessKeyId: config.accessKeyId, 
    secretAccessKey: config.secretAccessKey,
    region: 'us-west-2'});

var dynamoDB = {};

var dynamodbDoc = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();

dynamoDB.fetchstream = function (io) {
    dynamodb.scan({TableName: "earthquakes"}, function(error, quakes) {
    	if (error) console.log(JSON.stringify(error));
    	else {
    		_.each(quakes.Items, function(rawquake) {
                var quake = {};
                quake.lat = rawquake.lat.N;quake.lon = rawquake.lon.N;
                quake.magnitude = rawquake.magnitude.N;quake.id = rawquake.id.S;
                quake.wells = [];
                pg.connect(conString, function(err, client, done) {
                    if(err) {
                        return console.error('error fetching client from pool', err);
                    }
                    client.query('select * from getwells($1::text, $2::text, $3::text, $4::text)', 
                    dynamoDB.getBoundingBox([parseFloat(quake.lat), parseFloat(quake.lon)], 10),
                    function(err, result) {
                        done();
                        if(err) return console.error('error running query', err);
                        for(var i = 0; i < result.rows.length; i++) {
                            quake.wells.push(result.rows[i]);
                        }
                        io.emit("quake", quake);
                    });
                });
    		});
    	}
	});
};

dynamoDB.fetchwells = function(socket) {
    // this initializes a connection pool
    // it will keep idle connections open for a (configurable) 30 seconds
    // and set a limit of 10 (also configurable)
    pg.connect(conString, function(err, client, done) {
        if(err) return console.error('error fetching client from pool', err);
        client.query('select distinct lat, lon from wells', 
        [], 
        function(err, result) {
            var wells = [];
            done(); //call to release the client back to the pool 
            if(err) return console.error('error running query', err);
            for(var i = 0; i < result.rows.length; i++) {
                wells.push(result.rows[i])
            }
            socket.emit("wells", wells);
        });
    });
};

dynamoDB.insertearthquake = function (earthquake, io) {
    dynamodbDoc.put({
        TableName: 'earthquakes',
        Item: {
            "id": earthquake.id,
            "lat": earthquake.lat,
            "lon": earthquake.lon,
            "magnitude": earthquake.magnitude
        }
    }, function(error, data) {
        if(error) console.log("error = " + JSON.stringify(error));
        else dynamoDB.fetchstream(io);
    });
};

dynamoDB.getBoundingBox = function (centerPoint, distance) {
    var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat, degLon, radLat, radLon, minLat, maxLat, minLon, maxLon, deltaLon;
    if (distance < 0) {return 'Illegal arguments';}
    Number.prototype.degToRad = function () {return this * (Math.PI / 180);};
    Number.prototype.radToDeg = function () {return (180 * this) / Math.PI;};
    MIN_LAT = (-90).degToRad();MAX_LAT = (90).degToRad();MIN_LON = (-180).degToRad();MAX_LON = (180).degToRad();
    R = 6378.1; // Earth's radius (km)
    radDist = distance / R;
    degLat = centerPoint[0];degLon = centerPoint[1];
    radLat = degLat.degToRad();radLon = degLon.degToRad();
    minLat = radLat - radDist;maxLat = radLat + radDist;minLon = void 0;maxLon = void 0;
    deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
    if (minLat > MIN_LAT && maxLat < MAX_LAT) {
        minLon = radLon - deltaLon; maxLon = radLon + deltaLon;
        if (minLon < MIN_LON) minLon = minLon + 2 * Math.PI;
        if (maxLon > MAX_LON) maxLon = maxLon - 2 * Math.PI;
    }
    else {
        minLat = Math.max(minLat, MIN_LAT);maxLat = Math.min(maxLat, MAX_LAT);minLon = MIN_LON;maxLon = MAX_LON;
    }
    return [String(minLat.radToDeg()), String(maxLat.radToDeg()), String(minLon.radToDeg()), String(maxLon.radToDeg())];
};


module.exports = dynamoDB;