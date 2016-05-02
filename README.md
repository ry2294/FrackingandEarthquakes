# Final project: Are all earthquakes natural ?
Rakesh Yarlagadda(ry2294), Maruthi Vemuri (msv2130), Saurav Jain (sj2726), Panchampreet Kaur (pk2506)

For our final project, we have created a NodeJS web server which polls the USGS data feed to get hourly live data of earthquakes occurring in US. After polling the earthquakes data, it is stored in the AWS DynamoDB storage and is pushed to the client's web browser using socket.io. Basically, the server pushes two kinds of data to the client's browser. Firstly, the live earthquakes data and Secondly, the active injection wells data. The injection wells data is stored in AWS Postgres storage for performing range queries on lat, long values. Please follow the below commands to start the web server. The logic of the algorithm we used for classifying an earthquake as Manmade is explained in revised design document, code comments and website homepage.

### Commands
To run this application, clone this repository and run the below commands inside the repository folder FrackingandEarthquakes.

1. npm install // installs the node modules required

2. Please add "accessKeyId" and "secretAccessKey" values to config.js file. I have uploaded a "keys" file in the project submission. Since, AWS does not allow to keep confidential information on Public GitHub repo, I have added this information in the keys file. Please replace the accessKeyId and secretAccessKey values from keys file to config.js file and execute the next command.

3. node server.js // runs the server and starts consuming tweets

4. open url: localhost:5000/ in browser