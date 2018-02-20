var express = require('express');
var session = require('express-session');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var each = require('async-each');
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

function uploadPostcodes(done){

	if(!process.argv[3]){
		console.log('upc requires a path to csv folder');
		return done();
	}

	const csvFolder = process.argv[3]; // "D:\\dev\\node\\mylocal\\models\\data\\Location Data\\csvs";

	fs.readdir(csvFolder, function(err, items){
		if(err){
			console.log('readdir error');
			console.log(err);
			done();
		}

		items.forEach(function(item){

			pn.pushJob(function(){

				return new Promise(function(resolve, reject){

					let jsonArr = [];

					csv()
					.fromFile(csvFolder + "\\" + item)
					.on('json',(jsonObj)=>{
					    jsonArr.push(jsonObj);
					})
					.on('done',(error)=>{

						process.stdout.write(item + ' CSV to JSON complete \n');

						Postcode.uploadFromJSON(jsonArr, (msg) => {
							process.stdout.write('========================================= \n');
							process.stdout.write(msg);
							process.stdout.write('========================================= \n');
							resolve(msg);
						});

					})
					.on('error',(err)=>{
					    console.log('Json Error: ', err);
					    reject(err);
					});

				});
					
			});

		});

		

		// each(items, (item, next) => {

		// 	let jsonArr = [];

		// 	csv()
		// 	.fromFile(csvFolder + "\\" + item)
		// 	.on('json',(jsonObj)=>{
		// 	    jsonArr.push(jsonObj);
		// 	})
		// 	.on('done',(error)=>{

		// 		process.stdout.write(item + ' CSV to JSON complete \n');

		// 		Postcode.uploadFromJSON(jsonArr, (msg) => {
		// 			process.stdout.write('========================================= \n');
		// 			process.stdout.write(msg);
		// 			process.stdout.write('========================================= \n');
		// 			next();
		// 		});

		// 	})
		// 	.on('error',(err)=>{
		// 	    console.log('Json Error: ', err);
		// 	    done();
		// 	});

		// }, (err) => {
		// 	if(err){
		// 		console.log('ERRO: ', err);
		// 	}
		// 	console.log('all imported');
		// 	done();
		// });

	});

}

function countUnknownLocs(done){

	Listing.count({loc: undefined}, function(err, count){

		if(err){
			console.log(err);
			return;
		}

		console.log(count);
		done();

	});

}

function updateAllLocs(done){
	Listing.find({loc: undefined}).limit(10).exec(function(err, listings){

		if(err){
			console.log(err);
			return;
		}

		console.log(listings.length + ' listings found');

		each(listings, function(item, next){

			Postcode.findOne({'postcode': item.address.post_code}, function(err, postcode){

				if(postcode){

					item.loc = [postcode.longitude, postcode.latitude];
					item.save(function(err, item, saved){
						console.log('saved ', saved);
						next();
					});

				}else{
					console.log('NO POSTCODE');
					next();
				}

			});

		}, function(){
			console.log('done');
			process.exit();
		});

	});
}

switch(process.argv[2]){

	case undefined: 
		console.log('-------------------------------------------------------------');
		console.log('No option given, choose from:');
		console.log('update - updates all locations from postcode');
		console.log('unknown - returns how many listings have unkonw locations');
		consoel.log('upc - uploads all postcodes');
		console.log('-------------------------------------------------------------');
		break;
	case 'update':
		updateAllLocs(() => {
			process.exit();
		});
		break;
	case 'unknown':
		countUnknownLocs(() => {
			process.exit();
		});
		break;
	case 'upc':
		uploadPostcodes(() => {
			process.exit();
		});
		break;
	default:
		console.log('That is not an option'); 
		process.exit();

}