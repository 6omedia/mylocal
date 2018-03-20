var Listing = require('../models/listing');
var Postcode = require('../models/postcode');

const https = require('https');
var SN = require('sync-node');
var pn = SN.createQueue();

function importListings(listings, callback){

	listings.forEach(function(item){
		pn.pushJob(function(){

			return new Promise(function(resolve, reject){

				

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

function updateAllLocs(done){

	let updated = 0;

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