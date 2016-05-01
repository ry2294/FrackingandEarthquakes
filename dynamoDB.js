var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: '', 
    secretAccessKey: '',
    region: 'us-west-2'});

var dynamoDB = {};

var dynamodbDoc = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();

dynamoDB.insertearthquake = function (earthquake) {
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
    });
};

dynamoDB.fetchstream = function (io) {
    dynamodb.scan({TableName: "earthquakes"}, function(error, quakes) {
	if (error) console.log(JSON.stringify(error));
	else {
		console.log(JSON.stringify(quakes.Items[0]));
		_.each(quakes.Items, function(rawquake) {
            var quake = {};
            quake.lat = rawquake.lat.S;quake.lon = rawquake.lon.S;
            quake.magnitude = rawquake.magnitude.S;quake.id = rawquake.id.S;
            io.emit("quake", quake);
		});
	}
}

module.exports = dynamoDB;