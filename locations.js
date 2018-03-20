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
var Town = require('./models/town');
var Suburb = require('./models/suburb');

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

function geocodePostcode(postcode, callback){

	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${postcode}&key=AIzaSyD73USVFKI1lO5dQV4KYVs-UiZOBVYuAPo`;

	https.get(url, (resp) => {

		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {

			const jsonData = JSON.parse(data);

			if(jsonData.results.length == 0){
				return callback('No Results');
			}else{

				let town;

				const jsonLocation = jsonData.results[0].geometry.location;
				const address = jsonData.results[0].address_components;

				const townFilter = address.filter(function( obj ) {
					return obj.types.includes('postal_town');
				});

				if(townFilter.length > 0){
					town = townFilter[0].long_name;
				}

				callback(null, jsonLocation.lng, jsonLocation.lat, town);	

			}
			
		});

	}).on("error", (err) => {
		console.log("Geocode Error: " + err.message);
		callback(err);
	});

}

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
					.fromFile(csvFolder + "/" + item)
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

	});

}

function countUnknownLocs(Model, prop, done){

	Model.count({[prop]: undefined}, function(err, count){

		if(err){
			console.log(err);
			return;
		}

		// console.log(count);
		done(count);

	});

}

function updateAllLocs(done){

	Listing.find({loc: undefined}).exec(function(err, listings){

		if(err){
			console.log(err);
			return;
		}

		console.log(listings.length + ' listings found');

		listings.forEach(function(listing){
			pn.pushJob(function(){

				return new Promise(function(resolve, reject){

					Postcode.findOne({'postcode': listing.address.post_code}, function(err, postcode){

						if(postcode){

							listing.loc = [postcode.longitude, postcode.latitude];
							listing.save(function(err, item, saved){
								console.log('saved ', saved);
								resolve();
							});

						}else{
							console.log('NO POSTCODE gonna geocode it...');

							geocodePostcode(listing.address.post_code, (err, lng, lat, town) => {

								if(!err){

									if(!town){
										return reject();
									}

									const postcode = new Postcode({
										postcode: listing.address.post_code,
									    county: '',
									    town: town,
									    suburb: '',
									    latitude: lat,
									    longitude: lng
									});

									postcode.save()
									.then((postcode) => {
										resolve(postcode);
									})
									.catch((err) => {
										reject(err);
									});
									
								}else{
									console.log('Err ', listing.address.post_code);
									reject();
								}	

							});

						}

					});	

				});

			});
		});

		pn.pushJob(function(){

			return new Promise(function(resolve, reject){
				console.log('All Listings Updated');
				process.exit();
				resolve();
			});

		});

	});

}

function updatesuburb_towns(callback){

	countUnknownLocs(Postcode, 'suburb_town', (count) => {

		Postcode.find({suburb_town: undefined}).limit(50000).exec((err, postcodes) => {

			var index = 0;

			postcodes.forEach((postcode) => {

				pn.pushJob(function(){
					return new Promise(function(resolve, reject){
						postcode.suburb_town = postcode.suburb + ', ' + postcode.town;
						postcode.save(function(err, item, saved){
							index++;
							if(saved > 0){
								console.log(index + ' out of ' + count + ' updated');
							}
							resolve();
						});
					});
				});

			});

			pn.pushJob(function(){
				return new Promise(function(resolve, reject){
					process.exit();
					resolve();
				});
			});	

		});

	});

}

function populateCollection(Model, distinctProp, callback){

	Postcode.distinct(distinctProp, (err, docs) => {

		console.log('found ' + docs.length);

		var index = 0;

		docs.forEach((doc) => {

			pn.pushJob(function(){
				return new Promise(function(resolve, reject){

					geocodePostcode(doc, (err, lng, lat, town) => {

						if(err){
							console.log(err);
							return reject();
						}

						if(!lat){
							console.log('No latitude');
							return reject();
						}

						var name = doc;
						if(distinctProp == 'suburb'){
							if(town == undefined){
									
								return resolve();

							}else{
								name = doc + ', ' + town;
							}
						}

						var location = new Model({
							name: name,
						    county: '',
						    latitude: lat,
						    longitude: lng
						});

						location.save()
							.then((err, item, saved) => {
								index++;
								if(saved > 0){
									console.log(index + ' out of ' + count + ' updated');
								}
								resolve();
							})
							.catch((e) => {
								console.log('Err');
								reject(e);
							});

					});

				});
			});

		});

		pn.pushJob(function(){
			return new Promise(function(resolve, reject){
				callback();
				resolve();
			});
		});	

	});

}

function updateTownsLatLng(callback){

	Town.find({latitude: null}, (err, towns) => {

		console.log(towns);

		towns.forEach((town) => {
			pn.pushJob(function(){
				return new Promise(function(resolve, reject){
					console.log('TOWN ', town);
					geocodePostcode(town.name, (err, lng, lat) => {

						if(err){
							console.log(err);
							return reject();
						}

						town.update({ 
							latitude: lat,
							longitude: lng
						}).then(() => {
							return resolve();
						}).catch((e) => {
							console.log(e);
							return reject();
						});

					});
				});
			});
		});

		pn.pushJob(function(){
			return new Promise(function(resolve, reject){
				resolve();
				callback();
			});
		});

	});

}

switch(process.argv[2]){

	case undefined: 
		console.log('-------------------------------------------------------------');
		console.log('No option given, choose from:');
		console.log('update - updates all locations from postcode');
		console.log('unknown - returns how many listings have unkonw locations');
		console.log('upc - uploads all postcodes');
		console.log('-------------------------------------------------------------');
		break;
	case 'update':
		updateAllLocs(() => {
			process.exit();
		});
		break;
	case 'unknown':
		if(!process.argv[3] || !process.argv[4]){
			console.log('Must provide name of model and name of unknown property');
			process.exit();
		}
		countUnknownLocs(eval(process.argv[3]), process.argv[4], (count) => {
			console.log(count);
			process.exit();
		});
		break;
	case 'upc':
		uploadPostcodes(() => {
			process.exit();
		});
		break;
	case 'geocode':
		geocodePostcode(process.argv[3], (err, lng, lat) => {

			if(!err){
				console.log(lng, ' ', lat);
			}	

			process.exit();
		});
		break;
	case 'suburbtowns':
		updatesuburb_towns(() => {
			process.exit();
		});
		break;
	case 'poptowns':
		populateCollection(eval(Town), 'town', (err) => {
			if(err){console.log(err)}
			process.exit();
		});
		break;
	case 'popsuburbs':
		populateCollection(eval(Suburb), 'suburb', (err) => {
			if(err){console.log(err)}
			process.exit();
		});
		break;
	case 'townslatlng':
		updateTownsLatLng(() => {
			process.exit();
		});
		break;
	default:
		console.log('That is not an option'); 
		process.exit();

}