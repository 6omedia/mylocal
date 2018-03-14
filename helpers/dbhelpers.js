var exports = {};

const pn = require('sync-node').createQueue();

const Town = require('../models/town');
const Suburb = require('../models/suburb');
const Postcode = require('../models/postcode');

function searchLocation(term, callback){

	term = new RegExp('^' + term, 'i');
    locations = [];

    pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			Town.find({name: term}).limit(10).select({name: 1}).lean()
				.then((towns) => {
					// locations = locations.concat(towns);
					towns.forEach((town) => {
						locations.push(town.name);
					});
					resolve();
				})
				.catch((e) => {
					console.log(e);
					reject(e);
				});

		});
			
	});

	pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			if(locations.length >= 10){
				return resolve();
			}

			Suburb.find({name: term}).limit(10 - locations.length).select({name: 1}).lean()
				.then((suburbs) => {
					// locations = locations.concat(suburbs);
					suburbs.forEach((suburb) => {
						locations.push(suburb.name);
					});
					resolve();
				})
				.catch((e) => {
					console.log(e);
					reject(e);
				});

		});
			
	});
    
	pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			if(locations.length >= 10){
				return resolve();
			}

			Postcode.find({postcode: term}).limit(10 - locations.length).select({postcode: 1}).lean()
				.then((postcodes) => {
					// locations = locations.concat(postcodes);	
					postcodes.forEach((postcode) => {
						locations.push(postcode.postcode);
					});
					resolve();
				})
				.catch((e) => {
					console.log(e);
					reject(e);
				});

		});
			
	});

	pn.pushJob(function(){

		return new Promise(function(resolve, reject){

			callback(null, locations);
			resolve();

		});
			
	});

}

function searchServices(term, callback){

	

}

exports.searchLocation = searchLocation;
exports.searchServices = searchServices;
module.exports = exports;