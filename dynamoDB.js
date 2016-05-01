var _ = require('underscore');
var AWS = require('aws-sdk');
var pg = require('pg');
var sleep = require('sleep');

var conString = "postgres://rakesh891:!QAZ2wsx@postgresserver.cvti2cxbktmb.us-west-2.rds.amazonaws.com/postgres";

AWS.config.update({
    accessKeyId: '', 
    secretAccessKey: '',
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
                
                // this initializes a connection pool
                // it will keep idle connections open for a (configurable) 30 seconds
                // and set a limit of 10 (also configurable)
                pg.connect(conString, function(err, client, done) {
                    if(err) {
                        return console.error('error fetching client from pool', err);
                    }
                    client.query('select * from getwells($1::text, $2::text)', 
                    [String(quake.lat), String(quake.lon)], 
                    function(err, result) {
                        done(); //call to release the client back to the pool 
                        if(err) return console.error('error running query', err);
                        for(var i = 0; i < result.rows.length; i++) {
                            quake.wells.push(result.rows[i]);
                            console.log(result.rows[i]);
                        }
                        console.log(quake);
                        io.emit("quake", quake);
                    });
                });
    		});
    	}
	});
};

dynamoDB.fetchwells = function(io) {
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
                console.log(result.rows[i]);
                wells.push(result.rows[i])
            }
            io.emit("wells", wells);
            dynamoDB.fetchstream(io);
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

module.exports = dynamoDB;