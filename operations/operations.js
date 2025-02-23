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

// var Listing = require('../models/listing');
// var Postcode = require('../models/postcode');

// const geocodePostcode = require('./functions.js').geocodePostcode;
const updateAllLocs = require('./functions.js').updateAllLocs;
const countUnknownLocs = require('./functions.js').countUnknownLocs;
const importListings = require('./functions.js').importListings;
const unknownTownLocs = require('./functions.js').unknownTownLocs;
const updateTownLocs = require('./functions.js').updateTownLocs;
const importTerms = require('./functions.js').importTerms;

var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var config = '';

if(process.env.NODE_ENV == 'test'){
	config = require('../config/test.json');
}else{
	config = require('../config/dev.json');
}

let options = { 
	server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
	replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } 
};

//db connection      
mongoose.connect(config.db, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

function commandrequires(args, num){
	if(args.length < num){
		console.log('Requires ' + num + ' arguments'); 
		process.exit();
	}
}

switch(process.argv[2]){
	case 'upload-csv':

		break;
	case 'upload-json':
		


		break;
	case 'upload-listings':

		commandrequires(process.argv, 4);

		importListings(process.argv[3], (err) => {
			if(err){
				console.log(err);
				return process.exit();
			}
			console.log('Done');
			return process.exit();
		});

		break;
	case 'unknown-locs':
		
		countUnknownLocs((count) => {
			console.log(count + ' unknown location listings');
			process.exit();
		});

		break;
	case 'update-listing-locs':
		
		updateAllLocs(parseInt(process.argv[3]), process.argv[4], (updated) => {
			console.log(updated, ' listings were updated');
			process.exit();
		});

		break;
	case 'unknown-town-locs':
		
		unknownTownLocs((count) => {
			console.log(count + ' unknown town locations');
			process.exit();
		});

		break;
	case 'update-town-locs':

		updateTownLocs(parseInt(process.argv[3]), (updated) => {
			console.log(updated, ' towns were updated');
			process.exit();
		});

		break;
	case 'upload-terms':

		commandrequires(process.argv, 4);

		importTerms(process.argv[3], (err) => {
			if(err){
				console.log(err);
				return process.exit();
			}
			console.log('Done');
			return process.exit();
		});

		break;
	default:

		console.log('|--------- commands ---------|');
		console.log('| upload-listings');
		console.log('| unknown-locs');
		console.log('| update-listing-locs');
		console.log('| unknown-town-locs');
		console.log('| update-town-locs');
		console.log('| upload-terms');
		process.exit();
}