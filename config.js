/*
config.js file contains the keys required for the web server to coomunicate with the AWS Technologies. Especially required for the server to interact with DynamoDB and fetch live earthquakes data. Since AWS does not allow to store the keys in Public GitHub profile, I have uploaded a keys file in the project submission in courseworks which contain the accessKeyId and secretAccessKey values. Please copy them from the keys file and paste them here.
*/
var config = {};

config.accessKeyId = '';
config.secretAccessKey = '';

module.exports = config;