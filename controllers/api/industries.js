const express = require('express');
const industryRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Listing = require('../../models/listing');
const Service = require('../../models/service');
const Industry = require('../../models/industry');
const pagination = require('../../helpers/pagination');
const bcrypt = require('bcrypt');
const mid = require('../../middleware/session');

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

industryRoutes.get('/', function(req, res){

	let data = {};

	Industry.findById(req.query.industryid, (err, industry) => {

		if(err){
			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.json(data);
		}

		res.status(200);
		data.industry = industry;
		return res.json(data);

	});

});

industryRoutes.get('/featured', function(req, res){

	let data = {};

	Industry.getFixedFeatured((err, featured) => {

		if(err){
			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.json(data);
		}

		res.status(200);
		data.success = 1;
		data.featured = featured;
		return res.json(data);

	});

});

industryRoutes.get('/search', function(req, res){

	let data = {};
	data.success = 0;

	let query = {};

	const reg = new RegExp('^' + escapeRegex(req.query.term), 'gi');

	if(req.query.term){
		query.$or = [{aliases: reg}, {name: reg}];
	}

	if(req.query.allow_featured){
		query.allow_featured = true;
		query.featured = 0;
	}

	Industry.find(query)
		.limit(10)
		.lean()
		.exec(function(err, industries){

		if(err){
			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.json(data);
		}

		res.status(200);
		data.results = industries;
		return res.json(data);

	});

});

// industryRoutes.get('/search', function(req, res){

// 	let data = {};
// 	data.success = 0;

// 	let query = {};

// 	if(req.query.term){
// 		query.name = new RegExp(escapeRegex(req.query.term), 'gi');
// 	}

// 	Industry.find(query).limit(10).exec(function(err, industries){

// 		if(err){
// 			data.error = err.message || 'Internal Server Error';
// 			res.status(err.status || 500);
// 			return res.json(data);
// 		}

// 		Service.find(query).limit(10).exec(function(err, services){

// 			if(err){
// 				data.error = err.message || 'Internal Server Error';
// 		    	res.status(err.status || 500);
// 		    	return res.json(data);
// 			}

// 			res.status(200);
// 			data.results = industries.concat(services);
// 			return res.json(data);

// 		});

// 	});

// });

industryRoutes.get('/services/:industry/search', function(req, res){

	let data = {};
	data.success = 0;

	Industry.findOne({name: req.params.industry}, function(err, industry){

		if(err){
			console.log(err);
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		var regex = new RegExp('^' + escapeRegex(req.query.term), 'gi');

		data.results = industry.services.filter(function(val){
			return regex.test(val);
		});

		res.status(200);
    	return res.json(data);

	});

});

industryRoutes.get('/services/search', function(req, res){

	let data = {};
	data.success = 0;

	if(!req.query.industry){
		data.error = 'Industry Required';
    	res.status(400);
    	return res.json(data);
	}

	if(req.query.industry == 'unset'){
		data.results = [];
		return res.json(data);
	}

	Industry.findOne({name: req.query.industry}, function(err, industry){

		if(err){
			console.log(err);
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}		

		if(!industry){
			data.services = [];
			res.status(200);
    		return res.json(data);
		}

		var regex = new RegExp('^' + escapeRegex(req.query.term), 'gi');

		data.results = industry.services.filter(function(val){
			return regex.test(val);
		});

		console.log(data);

		res.status(200);
    	return res.json(data);

	});

});

industryRoutes.post('/add', mid.onlyAdmin, function(req, res){

	let data = {};

	const industry = new Industry({
		name: req.body.name,
		aliases: req.body.aliases,
		services: req.body.services
	});

	industry.save()
		.then(() => {
			data.success = 'Industry ' + req.body.name + ' created';
	    	res.status(200);
	    	return res.json(data);
		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
	    	res.status(e.status || 500);
	    	return res.json(data);
		});

});

industryRoutes.post('/toggle-featured', mid.onlyAdmin, function(req, res){

	let data = {};

	Industry.findById(req.body.industryid, (err, industry) => {

		if(err){
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		industry.allow_featured = req.body.allow_featured;

		industry.save()
		.then(() => {
			data.success = 'Industry ' + req.body.name + ' updated';
	    	res.status(200);
	    	return res.json(data);
		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
	    	res.status(e.status || 500);
	    	return res.json(data);
		});

	});

});

industryRoutes.post('/update', mid.onlyAdmin, function(req, res){

	let data = {};

	Industry.findById(req.body.industryid, (err, industry) => {

		if(err){
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		industry.name = req.body.name;
		industry.aliases = req.body.aliases;
		industry.services = req.body.services;

		industry.save()
		.then(() => {
			data.success = 'Industry ' + req.body.name + ' updated';
	    	res.status(200);
	    	return res.json(data);
		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
	    	res.status(e.status || 500);
	    	return res.json(data);
		});

	});

});

industryRoutes.post('/set-featured', mid.onlyAdmin, function(req, res){

	let data = {};

	let saves = [];

	Industry.update({}, { $set: {featured: 0}  }, {multi: true})
		.then((results) => {

			if(results.nModifed == 0){
				data.error = 'Did not update';
		    	res.status(500);
		    	return res.json(data);
			}

			if(req.body.pos1.id){
				saves.push(Industry.update({_id: req.body.pos1.id}, {featured: 1}));
			}

			if(req.body.pos2.id){
				saves.push(Industry.update({_id: req.body.pos2.id}, {featured: 2}));
			}

			if(req.body.pos3.id){
				saves.push(Industry.update({_id: req.body.pos3.id}, {featured: 3}));
			}

			if(req.body.pos4.id){
				saves.push(Industry.update({_id: req.body.pos4.id}, {featured: 4}));
			}

			if(req.body.pos5.id){
				saves.push(Industry.update({_id: req.body.pos5.id}, {featured: 5}));
			}

			Promise.all(saves)
				.then(() => {
					data.success = 'featured categories updated';
			    	res.status(200);
			    	return res.json(data);
				})
				.catch((e) => {
					data.error = e.message || 'Internal Server Error';
			    	res.status(e.status || 500);
			    	return res.json(data);
				});

		})
		.catch((e) => {
			data.error = e.message || 'Internal Server Error';
	    	res.status(e.status || 500);
	    	return res.json(data);
		});

});

industryRoutes.delete('/:industryid', mid.onlyAdmin, function(req, res){

	let data = {};

	Industry.remove({_id: req.params.industryid}, (err) => {

		if(err){
			data.error = err.message || 'Internal Server Error';
	    	res.status(err.status || 500);
	    	return res.json(data);
		}

		data.success = 'Industry removed';
    	res.status(200);
    	return res.json(data);

	});

});

module.exports = industryRoutes;