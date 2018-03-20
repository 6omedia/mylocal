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

industryRoutes.get('/search', function(req, res){

	let data = {};
	data.success = 0;

	let query = {};

	if(req.query.term){
		query.name = new RegExp('^' + escapeRegex(req.query.term), 'gi');
	}

	Industry.find(query).limit(10).exec(function(err, industries){

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

		var regex = new RegExp('^' + escapeRegex(req.query.term), 'gi');

		data.results = industry.services.filter(function(val){
			return regex.test(val);
		});

		console.log(data);

		res.status(200);
    	return res.json(data);

	});

});

module.exports = industryRoutes;