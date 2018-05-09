var Listing = require('../models/listing');
var Postcode = require('../models/postcode');
var Town = require('../models/town');

const https = require('https');
const fs = require('fs');
var SN = require('sync-node');
var pn = SN.createQueue();
var csv = require('csvtojson');

function importListings(folderPath, callback){

	const csvFolder = folderPath;
	// console.log('csvFolder ', csvFolder);

	let passed = 0;
	let failed = 0;

	fs.readdir(csvFolder, function(err, files){
		
		if(err){
			return callback(err);
		}

		process.stdout.write("Starting... " + files.length + " files to process");
		process.stdout.write("\n");

		files.forEach(function(file){
			
			pn.pushJob(function(){

				return new Promise(function(resolve, reject){

					// check file extention
					const ext = file.split('.').pop();

					if(ext == 'csv'){

						let jsonArr = [];

						csv()
						.fromFile(csvFolder + "/" + file)
						.on('json',(jsonObj)=>{

							// console.log(jsonObj);

							let listing = {
						        business_name: jsonObj.Company,
						        address: {
						        	line_one: jsonObj['Address 1'],
						        	line_two: jsonObj['Address 2'],
						        	town: jsonObj.City,
						        	post_code: jsonObj['ZIP Code']
						        },
						        contact: {
						        	website: jsonObj.Website,
						        	phone: jsonObj.Phone,
						        	email: jsonObj.Email
						        },
						        industry: jsonObj.Industry,
						        social: {
						        	style: 'Standard',
						        	icons: {
						                facebook: jsonObj.Facebook,
						                twitter: jsonObj.Twitter,
						                googleplus: jsonObj.GooglePlus,
						                linkedin: jsonObj.Linkedin
						            }
							    }
						    };	

						    // console.log(listing);

						    jsonArr.push(listing);

						})
						.on('done',(error)=>{

							process.stdout.write("\n");

							Listing.uploadFromJSON(jsonArr, (doneMsg) => {

								process.stdout.write("\n");
								process.stdout.write(file + ' CSV to JSON complete \n');
								resolve();

							});

						})
						.on('error',(err)=>{
							process.stdout.write(err);
						  	reject();
						});

					}else if(ext == 'json'){

						process.stdout.write('cant upload from json just yet, upload as csv for now');
						reject();

					}else{

						process.stdout.write('Incorrect file type, must be either json or csv');
						reject();

					}

				});
					
			});

			// convert to json file
			// create listing
			// output results
			// add to saved / failed

		});

		pn.pushJob(function(){

			return new Promise(function(resolve, reject){

				resolve();
				return callback(null);

			});
				
		});

	});

}

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
				return callback(new Error('No Results'));
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

function unknownTownLocs(done){

	Town.count({loc: undefined}, function(err, count){

		if(err){
			console.log(err);
			process.exit();
		}

		done(count);

	});

}

function updateTownLocs(limit, done){

	let updated = 0;

	Town.find({loc: undefined})
	.limit(limit)
	.exec(function(err, towns){

		if(err){
			console.log(err);
			return;
		}

		towns.forEach(function(town){
			pn.pushJob(function(){

				return new Promise(function(resolve, reject){

					town.loc = [town.longitude, town.latitude];
					town.save(function(err, item, saved){

						if(saved > 0){
							updated++;
						}

						console.log('saved ', saved);
						resolve();

					});

				});

			});
		});

		pn.pushJob(function(){

			return new Promise(function(resolve, reject){
				done(updated);
				process.exit();
				resolve();
			});

		});

	});

}

function updateAllLocs(limit, done){

	let updated = 0;

	Listing.find({loc: undefined})
		.limit(limit)
		.exec(function(err, listings){

		if(err){
			console.log(err);
			return;
		}

		console.log(listings.length + ' listings found');

		listings.forEach(function(listing){
			pn.pushJob(function(){

				return new Promise(function(resolve, reject){

					Postcode.findOne({'postcode': listing.address.post_code.toUpperCase()}, function(err, postcode){

						if(postcode){

							listing.loc = [postcode.longitude, postcode.latitude];
							listing.save(function(err, item, saved){

								if(saved > 0){
									updated++;
								}

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
				done(updated);
				process.exit();
				resolve();
			});

		});

	});

}

function countUnknownLocs(done){

	Listing.count({loc: undefined}, function(err, count){

		if(err){
			console.log(err);
			process.exit();
		}

		done(count);

	});

}

module.exports.geocodePostcode = geocodePostcode;
module.exports.updateAllLocs = updateAllLocs;
module.exports.countUnknownLocs = countUnknownLocs;
module.exports.importListings = importListings;
module.exports.unknownTownLocs = unknownTownLocs;
module.exports.updateTownLocs = updateTownLocs;