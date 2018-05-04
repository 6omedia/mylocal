const express = require('express');
const townRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Service = require('../../models/service');
const Industry = require('../../models/industry');
const Town = require('../../models/town');
const pagination = require('../../helpers/pagination');
const mid = require('../../middleware/session');

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

townRoutes.get('/search', function(req, res, next){

	let data = {};
	data.success = 0;
	data.terms = [];

	if(!req.query.term || req.query.term == 'noterm'){
		return res.json(data);
	}

	const term = new RegExp('^' + req.query.term, 'ig');

	Town.find({name: term})
		.limit(10)
		.lean()
		.exec(function(err, towns){

		if(err){
			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.json(data);
		}

		res.status(200);
		data.towns = towns;
		return res.json(data);

	});

});

townRoutes.post('/addcapital', function(req, res){

	let data = {};
	data.success = 0;

	Town.findOne({name: req.body.town})
	.then((town) => {
		
		if(!town){
			data.error = 'No town called ' + req.body.town;
			return res.json(data);	
		}

		town.capital = true;

		town.save()
		.then(() => {

			var docsPerPage = 50;
			var page = req.query.page || 1;

			Town.count({})
				.then((count) => {
					Town.find({capital: true})
					.limit(docsPerPage)
					.skip(pagination.getSkip(page, docsPerPage))
					.then((towns) => {
						data.success = town.name + ' is now a capital town';
						data.pagination = pagination.getLinks(count, docsPerPage, page, '/admin/towns/capitals')
						data.towns = towns;
						return res.json(data);
					})
					.catch((err) => {
						data.error = err.message || 'Internal Server Error';
						res.status(err.status || 500);
						return res.json(data);
					});
				})
				.catch((err) => {
					data.error = err.message || 'Internal Server Error';
					res.status(err.status || 500);
					return res.json(data);
				});

		})
		.catch((err) => {
			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.json(data);
		});

	})
	.catch((err) => {
		data.error = err.message || 'Internal Server Error';
		res.status(err.status || 500);
		return res.json(data);
	});

});

townRoutes.post('/removecapital', function(req, res){

	let data = {};
	data.success = 0;

	Town.findOne({name: req.body.town})
	.then((town) => {
		
		if(!town){
			data.error = 'No town called ' + req.body.town;
			return res.json(data);	
		}

		town.capital = false;

		town.save()
		.then(() => {

			var docsPerPage = 50;
			var page = req.query.page || 1;

			Town.count({})
				.then((count) => {
					Town.find({capital: true})
					.limit(docsPerPage)
					.skip(pagination.getSkip(page, docsPerPage))
					.then((towns) => {
						data.success = town.name + ' is no longer a capital town';
						data.pagination = pagination.getLinks(count, docsPerPage, page, '/admin/towns/capitals')
						data.towns = towns;
						return res.json(data);
					})
					.catch((err) => {
						data.error = err.message || 'Internal Server Error';
						res.status(err.status || 500);
						return res.json(data);
					});
				})
				.catch((err) => {
					data.error = err.message || 'Internal Server Error';
					res.status(err.status || 500);
					return res.json(data);
				});

		})
		.catch((err) => {
			data.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.json(data);
		});

	})
	.catch((err) => {
		data.error = err.message || 'Internal Server Error';
		res.status(err.status || 500);
		return res.json(data);
	});

});

// townRoutes.get('/search', function(req, res){

// 	let data = {};
// 	data.success = 0;

// 	let query = {};

// 	const reg = new RegExp('^' + escapeRegex(req.query.term), 'gi');

// 	query.name = reg;

// 	Town.find(query)
// 		.limit(10)
// 		.lean()
// 		.exec(function(err, towns){

// 		if(err){
// 			data.error = err.message || 'Internal Server Error';
// 			res.status(err.status || 500);
// 			return res.json(data);
// 		}

// 		res.status(200);
// 		data.results = industries;
// 		return res.json(data);

// 	});

// });

module.exports = townRoutes;