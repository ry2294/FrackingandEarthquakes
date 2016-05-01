var express = require('express');
var app = express();
var router = express.Router();
var path = require("path");
var AWS = require('aws-sdk');
var _ = require('underscore');

AWS.config.update({
    accessKeyId: 'AKIAJCAQWMNEIC7J7AWA', 
    secretAccessKey: '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',
    region: 'us-west-2'});
    
var dynamodbDoc = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();

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