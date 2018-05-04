const express = require('express');
const catRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Listing = require('../../models/listing');
const Industry = require('../../models/industry');
const mid = require('../../middleware/session');
const pagination = require('../../helpers/pagination');

catRoutes.get('/', mid.onlyAdmin, function(req, res){

	const docsPerPage = 30;

	Industry.count({}, function(err, count){

		if(err){
			next(err);
		}

		Industry.find({})
			.sort({created_at: -1})
			.limit(docsPerPage)
			.skip(pagination.getSkip(req.query.page || 1, docsPerPage))
			.populate('userId')
			.exec(function(err, industries){

			if(err){
				next(err);
			}

			res.render('admin/categories/all', {
				section: 'categories',
				industries: industries,
				paginationLinks: pagination.getLinks(count, docsPerPage, req.query.page || 1),
				error: ''
			});

		});

	});

});

catRoutes.get('/featured', mid.onlyAdmin, function(req, res, next){

	Industry.getFixedFeatured((err, featured) => {

		if(err){
			next(e);
		}

		res.render('admin/categories/featured', {
			section: 'categories',
			featured: featured,
			error: ''
		});

	});

});

module.exports = catRoutes;