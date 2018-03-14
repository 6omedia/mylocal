var express = require('express');
var session = require('express-session');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const https = require('https');

var each = require('async-each');
var eachSync = require('sync-each');
var csv = require('csvtojson');
var fs = require('fs');
var SN = require('sync-node');
var pn = SN.createQueue();

var Listing = require('./models/listing');
var Postcode = require('./models/postcode');

var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var config = '';

if(process.env.NODE_ENV == 'test'){
	config = require('./config/test.json');
}else{
	config = require('./config/dev.json');
}

let options = { 
	server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
	replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } 
};

//db connection      
mongoose.connect(config.db, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

switch(process.argv[2]){
	case 'upload-csv':

		break;
	case 'upload-json':
		
		break;
	case 'unknown':
		
		break;
	default:
}
